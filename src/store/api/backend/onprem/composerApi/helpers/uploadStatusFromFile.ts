import type { UploadStatus } from '../../../hosted';

import { safeReadJsonFile } from './safeReadJsonFile';

type UploadResult = {
  provider: string,
  image_id: string,
};

export const uploadStatusFromFile = async (
  file: string
): Promise<UploadStatus> => {
  const uploadResult = await safeReadJsonFile<UploadResult>(file);
  const failureState = {
      status: "failure",
      type: "local",
      options: {}
    }

  if (uploadResult === null) {
    return failureState;
  }

  switch (uploadResult.provider) {
    case 'LocalPath':
      return {
        status: "success",
        type: "local",
        options: {
          artifact_path: uploadResult.image_id,
        },
      };
    default:
      return failureState;
  }
};
