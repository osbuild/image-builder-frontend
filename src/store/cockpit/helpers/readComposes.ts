import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { BLUEPRINTS_DIR } from '../../../constants';
import { ComposesResponseItem } from '../../imageBuilderApi';

export const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

export const readComposes = async (bpID: string) => {
  const blueprintsDir = await getBlueprintsPath();
  let composes: ComposesResponseItem[] = [];
  const bpInfo = await fsinfo(
    path.join(blueprintsDir, bpID),
    ['entries', 'mtime'],
    {
      superuser: 'try',
    },
  );
  const bpEntries = Object.entries(bpInfo?.entries || {});
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
        created_at: new Date(entry[1]!.mtime * 1000).toString(),
        blueprint_id: bpID,
      },
    ];
  }
  return composes;
};
