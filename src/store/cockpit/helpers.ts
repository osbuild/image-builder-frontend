import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { BLUEPRINTS_DIR } from '../../constants';
import { ComposesResponseItem } from '../imageBuilderApi';

export const lookupDatastreamDistro = (distribution: string) => {
  if (distribution.startsWith('fedora')) {
    return 'fedora';
  }

  if (distribution === 'centos-9') {
    return 'cs9';
  }

  if (distribution === 'centos-10') {
    return 'cs10';
  }

  if (distribution === 'rhel-9') {
    return 'rhel9';
  }

  if (distribution === 'rhel-10') {
    return 'rhel10';
  }

  throw 'Unknown distribution';
};

export const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

export const composeStatus = async (composeId: string, composeDir: string) => {
  const files = await fsinfo(composeDir, ['entries', 'mtime'], {
    superuser: 'try',
  });

  const fileEntries = Object.entries(files?.entries || {});
  for await (const entry of fileEntries) {
    if (entry[0] === 'result.bad') {
      return {
        status: 'failure',
      };
    }

    if (entry[0] === 'result.good') {
      return {
        status: 'success',
        upload_status: {
          options: {
            artifact_path: path.join(
              '/var',
              'lib',
              'osbuild-composer',
              'artifacts',
              composeId,
            ),
          },
        },
      };
    }
  }

  return {
    status: 'building',
  };
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
      .file(path.join(blueprintsDir, bpID, entry[0], 'request.json'))
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

export const imageTypeLookup = (imageType: string) => {
  // Fedora image types have a `server-` prefix that
  const image = imageType.startsWith('server-')
    ? imageType.slice('server-'.length)
    : imageType;

  // this is a list of types that we know we need to translate
  const lookup: Record<string, string> = {
    qcow2: 'guest-image',
    ami: 'aws',
    gce: 'gcp',
    vhd: 'azure',
    vmdk: 'vshpere',
    ova: 'vsphere-ova',
  };

  const result = lookup[image];
  return result ? result : image;
};

export const paginate = <T extends { id: string }>(
  items: T[],
  offset?: number | undefined,
  limit?: number | undefined,
) => {
  const first = items.length > 0 ? items[0].id : '';
  const last = items.length > 0 ? items[items.length - 1].id : '';

  return {
    data: {
      meta: { count: items.length },
      links: {
        first: first,
        last: last,
      },
      data: items.slice(offset ?? 0, limit ?? 100),
    },
  };
};
