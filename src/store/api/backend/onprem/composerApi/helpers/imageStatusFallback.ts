import path from 'path';

import { fsinfo } from 'cockpit/fsinfo';

import type { ImageStatus } from '../../../hosted';
import { assertImageStatus } from '../../typeguards';

export const imageStatusFallback = async (
  composeID: string
): Promise<ImageStatus> => {
  const dataDir = path.join("/var/lib/osbuild-composer/artifacts", composeID);

  let entries;
  try {
    const info = await fsinfo(dataDir, ['entries'], {
      superuser: 'try',
    });
    entries = info.entries || {};
  } catch {
    return {
      status: "failure",
      error: {
        id: 10,
        reason: "missing artifact directory",
      },
    };
  }

  if (Object.keys(entries).length > 0) {
    return assertImageStatus({
      status: "success",
      upload_status: {
        status: "success",
        type: "local",
        options: {
          artifact_path: path.join(dataDir, Object.keys(entries)[0]),
        },
      },
    });
  }
  return {
    status: "failure",
    error: {
      id: 10,
      reason: "missing artifact in fallback directory",
    },
  };
};
