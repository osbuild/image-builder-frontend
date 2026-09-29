import path from 'path';

import cockpit from 'cockpit';

import { getBlueprintsPath } from '@/store/api/backend/onprem/composerApi/helpers/getBlueprintsPath';

import { getBlueprintSplits } from './getBlueprintSplits';
import type { BlueprintMigrationError } from './types';

export const applyBlueprintSplits = async () => {
  const result = await getBlueprintSplits();
  if ('error' in result) {
    const { blueprintId, composeId, code } = result.error;
    throw new Error(
      `Could not split blueprint ${blueprintId}${composeId ? ` compose ${composeId}` : ''}: ${code}`,
    );
  }
  if (result.splits.length === 0) return;

  const blueprintsDir = await getBlueprintsPath();
  const backupPath = (
    (await cockpit.spawn([
      'mktemp',
      '-d',
      path.join(
        path.dirname(blueprintsDir),
        'cockpit-image-builder-backup-XXXXXXXX',
      ),
    ])) as string
  ).trim();

  try {
    await cockpit.spawn([
      'cp',
      '-a',
      '--',
      ...result.splits.map(({ sourceId }) =>
        path.join(blueprintsDir, sourceId),
      ),
      backupPath,
    ]);

    for (const split of result.splits) {
      for (const { id, blueprint } of split.blueprints.slice(1)) {
        const blueprintDir = path.join(blueprintsDir, id);
        await cockpit.spawn(['mkdir', '-p', blueprintDir]);
        await cockpit
          .file(path.join(blueprintDir, `${id}.json`))
          .replace(JSON.stringify(blueprint));
      }

      for (const compose of split.composes) {
        if (compose.blueprintId === split.sourceId) continue;

        await cockpit
          .file(path.join(blueprintsDir, compose.blueprintId, compose.id))
          .replace(JSON.stringify(compose.request));
      }
    }

    for (const split of result.splits) {
      await cockpit
        .file(
          path.join(blueprintsDir, split.sourceId, `${split.sourceId}.json`),
        )
        .replace(JSON.stringify(split.blueprints[0].blueprint));

      for (const compose of split.composes) {
        if (compose.blueprintId === split.sourceId) continue;

        await cockpit.spawn([
          'rm',
          '-f',
          path.join(blueprintsDir, split.sourceId, compose.id),
        ]);
      }
    }

    try {
      await cockpit.spawn(['rm', '-rf', '--', backupPath]);
    } catch {
      // Cleanup failure shouldn't turn a successful migration into a failure.
    }
  } catch (reason) {
    const error: BlueprintMigrationError = Object.assign(
      reason instanceof Error ? reason : new Error(String(reason)),
      { backupPath },
    );
    throw error;
  }
};
