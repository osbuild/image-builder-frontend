import path from 'path';

import { getBlueprintsPath } from './getBlueprintsPath';
import { safeReadJsonFile } from './safeReadJsonFile';

import type { UploadConfigFile } from '../../../onprem';

export const getUploadArgs = async (
  type: string,
  id: string,
): Promise<{ runArgs: string[]; ibArgs: string[] }> => {
  const stateDir = await getBlueprintsPath();
  const uploadConfig = await safeReadJsonFile<UploadConfigFile>(
    path.join(stateDir, 'upload-config.json'),
  );
  if (uploadConfig === null) {
    return { runArgs: [], ibArgs: [] };
  }

  switch (type) {
    case 'aws':
      if (
        uploadConfig.aws === undefined ||
        uploadConfig.aws.profile === undefined ||
        uploadConfig.aws.credentials === undefined ||
        uploadConfig.aws.region === undefined ||
        uploadConfig.aws.bucket === undefined
      ) {
        return { runArgs: [], ibArgs: [] };
      }
      return {
        runArgs: [
          '--setenv',
          `AWS_SHARED_CREDENTIALS_FILE=${uploadConfig.aws.credentials}`,
        ],
        ibArgs: [
          '--aws-ami-name',
          `image-builder-${id}`,
          '--aws-profile',
          uploadConfig.aws.profile,
          '--aws-region',
          uploadConfig.aws.region,
          '--aws-bucket',
          uploadConfig.aws.bucket,
        ],
      };
    default:
      return { runArgs: [], ibArgs: [] };
  }
};
