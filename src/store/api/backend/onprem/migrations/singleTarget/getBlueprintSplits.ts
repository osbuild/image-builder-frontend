import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { getBlueprintsPath } from '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath';
import type {
  ComposerComposesResponseItem,
  ComposerCreateBlueprintRequest,
} from '@/store/api/backend/onprem/types';

import { Split } from './types';

export const getBlueprintSplits = async () => {
  const blueprintsDir = await getBlueprintsPath();
  const bps = await fsinfo(blueprintsDir, ['entries', 'type']);

  if (!bps.entries) throw new Error('Could not list blueprints');

  const ids = new Set<string>();
  const names = new Set<string>();

  const candidates: {
    id: string;
    blueprint: ComposerCreateBlueprintRequest;
    composes: {
      id: string;
      request: ComposerComposesResponseItem['request'];
    }[];
  }[] = [];

  for (const [id, entry] of Object.entries(bps.entries)) {
    if (entry.type !== 'dir') continue;

    ids.add(id);
    const blueprintDir = path.join(blueprintsDir, id);
    const blueprint = JSON.parse(
      await cockpit.file(path.join(blueprintDir, `${id}.json`)).read(),
    ) as ComposerCreateBlueprintRequest;
    names.add(blueprint.name);

    if (blueprint.image_requests.length === 1) continue;

    const directory = await fsinfo(blueprintDir, ['entries', 'type']);
    if (!directory.entries)
      throw new Error(`Could not list composes for ${id}`);

    const composes: {
      id: string;
      request: ComposerComposesResponseItem['request'];
    }[] = [];
    for (const [composeId, compose] of Object.entries(directory.entries)) {
      if (composeId === `${id}.json`) continue;
      if (compose.type !== 'reg')
        throw new Error(
          `Invalid compose file ${path.join(blueprintDir, composeId)}: expected a regular file, found ${compose.type}`,
        );

      composes.push({
        id: composeId,
        request: JSON.parse(
          await cockpit.file(path.join(blueprintDir, composeId)).read(),
        ) as ComposerComposesResponseItem['request'],
      });
    }

    candidates.push({ id, blueprint, composes });
  }

  const splits: Split[] = [];
  for (const { id, blueprint, composes } of candidates) {
    const targetIds = new Map<string, string>();
    for (const request of blueprint.image_requests) {
      const key = JSON.stringify([request.image_type, request.architecture]);
      if (targetIds.has(key)) {
        return { error: { blueprintId: id, code: 'duplicate-target' } };
      }
      targetIds.set(key, id);
    }

    const blueprints: Split['blueprints'] = [];
    for (const request of blueprint.image_requests) {
      let name: string | undefined;
      for (const suffix of [
        ` - ${request.image_type}`,
        ` - ${request.image_type}-${request.architecture}`,
      ]) {
        if (suffix.length > 100) continue;
        const prefix = [...blueprint.name];
        while (prefix.join('').length > 100 - suffix.length) prefix.pop();
        const candidate = `${prefix.join('')}${suffix}`;
        if (names.has(candidate)) continue;
        name = candidate;
        break;
      }
      if (!name) return { error: { blueprintId: id, code: 'name-collision' } };

      const childId = blueprints.length === 0 ? id : crypto.randomUUID();
      if (childId !== id && ids.has(childId))
        return { error: { blueprintId: id, code: 'id-collision' } };
      ids.add(childId);
      names.add(name);
      targetIds.set(
        JSON.stringify([request.image_type, request.architecture]),
        childId,
      );
      blueprints.push({
        id: childId,
        blueprint: { ...blueprint, name, image_requests: [request] },
      });
    }

    const composeAssignments: Split['composes'] = [];
    for (const { id: composeId, request } of composes) {
      if (request.image_requests.length !== 1) {
        return {
          error: { blueprintId: id, composeId, code: 'invalid-compose' },
        };
      }
      const target = request.image_requests[0];
      const blueprintId = targetIds.get(
        JSON.stringify([target.image_type, target.architecture]),
      );
      if (!blueprintId) {
        return {
          error: { blueprintId: id, composeId, code: 'unmatched-compose' },
        };
      }
      composeAssignments.push({ id: composeId, blueprintId, request });
    }

    splits.push({ sourceId: id, blueprints, composes: composeAssignments });
  }

  return { splits };
};
