import { safeReadJsonFile } from './safeReadJsonFile';

import type { UploadStatus } from '../../../hosted';
import { assertUploadStatus } from '../../typeguards';

export type UploadResult = {
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
  } as unknown as UploadStatus;

  if (uploadResult === null) {
    return failureState;
  }

  switch (uploadResult.provider) {
    case 'LocalPath':
      return assertUploadStatus({
        status: "success",
        type: "local",
        options: {
          artifact_path: uploadResult.image_id,
        },
      });
    default:
      return failureState;
  }
};
