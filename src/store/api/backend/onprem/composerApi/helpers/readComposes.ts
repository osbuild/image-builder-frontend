import path from 'path';

import { fsinfo } from 'cockpit/fsinfo';

import type {
  ComposeRequest,
  ComposesResponseItem,
} from '@/store/api/backend/hosted';

import { getBlueprintsPath } from './getBlueprintsPath';
import { safeReadJsonFile } from './safeReadJsonFile';

export const readComposes = async (
  bpID: string,
): Promise<ComposesResponseItem[]> => {
  const blueprintsDir = await getBlueprintsPath();
  let composes: ComposesResponseItem[] = [];
  const bpInfo = await fsinfo(
    path.join(blueprintsDir, bpID),
    ['entries', 'mtime'],
    {
      superuser: 'try',
    },
  );
  const bpEntries = Object.entries(bpInfo.entries || {});
  for (const entry of bpEntries) {
    if (entry[0] === `${bpID}.json`) {
      continue;
    }
    const request = await safeReadJsonFile<ComposeRequest>(
      path.join(blueprintsDir, bpID, entry[0]),
    );
    if (!request) {
      continue;
    }

    composes = [
      ...composes,
      {
        id: entry[0],
        request,
        created_at: new Date(entry[1].mtime * 1000).toString(),
        blueprint_id: bpID,
      },
    ];
  }
  return composes;
};
