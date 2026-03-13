import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import type { ComposesResponseItem } from '@/store/api/backend/hosted';

import { getBlueprintsPath } from './getBlueprintsPath';

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
    const composeReq = await cockpit
      .file(path.join(blueprintsDir, bpID, entry[0]))
      .read();

    composes = [
      ...composes,
      {
        id: entry[0],
        request: JSON.parse(composeReq),
        created_at: new Date(entry[1].mtime * 1000).toString(),
        blueprint_id: bpID,
      },
    ];
  }
  return composes;
};
