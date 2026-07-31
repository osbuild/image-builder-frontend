import { getBlueprintsPath } from './getBlueprintsPath';
import { safeReadJsonFile } from './safeReadJsonFile';

import type { UploadConfigFile } from '../../../onprem';

export const getCloudConfigs = async (): Promise<string[]> => {
  const stateDir = await getBlueprintsPath();
  const uploadConfig = await safeReadJsonFile<UploadConfigFile>(
    path.join(stateDir, 'upload-config.json'),
  );

  if (
    uploadConfig &&
    upload.config.aws &&
    uploadConfig.aws.profile &&
    uploadConfig.aws.credentials &&
    uploadConfig.aws.region &&
    uploadConfig.aws.bucket
  ) {
    return ['aws'];
  }
  return [];
};
