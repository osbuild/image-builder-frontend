import type { UploadStatus } from '@/store/api/backend/hosted';
import { assertUploadStatus } from '@/store/api/backend/onprem/typeguards';

import { safeReadJsonFile } from './safeReadJsonFile';

export type UploadResult = {
  provider: string;
  image_id: string;
};

export const uploadStatusFromFile = async (
  file: string,
): Promise<UploadStatus> => {
  const uploadResult = await safeReadJsonFile<UploadResult>(file);
  const failureState = assertUploadStatus({
    status: 'failure',
    type: 'local',
    options: {},
  });

  if (uploadResult === null) {
    return failureState;
  }

  if (uploadResult.image_id === '') {
    return failureState;
  }

  switch (uploadResult.provider) {
    case 'LocalPath':
      return assertUploadStatus({
        status: 'success',
        type: 'local',
        options: {
          artifact_path: uploadResult.image_id,
        },
      });
    case 'aws':
      return assertUploadStatus({
        status: 'success',
        type: 'aws',
        options: {
          ami: uploadResult.image_id,
          region: '',
        },
      });
    default:
      return failureState;
  }
};
