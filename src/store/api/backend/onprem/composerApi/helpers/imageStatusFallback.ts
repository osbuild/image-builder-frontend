import path from 'path';
import { fsinfo } from 'cockpit/fsinfo';

import { ImageStatus } from '../../hosted';


export const imageStatusFallback = async (
  composeID: string
): Promise<ImageStatus> => {
  const dataDir = path.join("/var/lib/osbuild-composer/artifacts", composeID);

  let info;
  try {
    info = await fsinfo(dataDir, ['entries'], {
      superuser: 'try',
    });
  } catch {
    return {
      status: "failure",
      error: {
        reason: "missing artifact directory",
      },
    };
  }

  if (Object.keys(info.entries).length > 0) {
    return {
      status: "success",
      upload_status: {
        status: "success",
        type: "local",
        options: {
          artifact_path: path.join(dataDir, Object.keys(info.entries)[0]),
        },
      },
    };
  }
  return {
    status: "failure",
    error: {
      reason: "missing artifact in fallback directory",
    },
  };
};
