import path from 'path';

import TOML from '@ltd/j-toml';
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { Blueprint } from './composerCloudApi';
import { CockpitImageRequest } from './types';

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

export const getCloudConfigs = async () => {
  try {
    const worker_config = cockpit.file(
      '/etc/osbuild-worker/osbuild-worker.toml',
    );
    const contents = await worker_config.read();
    const parsed = TOML.parse(contents);
    return Object.keys(parsed).filter((k) => k === 'aws');
  } catch {
    return [];
  }
};

export const mapToOnpremRequest = (
  blueprint: Blueprint,
  distribution: string,
  image_requests: CockpitImageRequest[],
) => {
  return {
    blueprint,
    distribution,
    image_requests: image_requests.map((ir) => ({
      architecture: ir.architecture,
      image_type: ir.image_type,
      repositories: [],
      upload_targets: [
        {
          type: ir.upload_request.type,
          upload_options: ir.upload_request.options,
        },
      ],
    })),
  };
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
