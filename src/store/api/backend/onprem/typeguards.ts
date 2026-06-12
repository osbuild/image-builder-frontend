import { isNonNullObject, OnPremApiError } from '@/store/api/shared';

import type { ImageStatus, UploadStatus } from '../hosted';

export const isImageStatus = (value: unknown): value is ImageStatus => {
  if (!isNonNullObject(value) || !('status' in value) || typeof value.status !== 'string') {
    return false;
  }
  const uploadStatus = value.upload_status;
  if (uploadStatus) {
    return isUploadStatus(uploadStatus)
  }
  return true;
};

export const assertImageStatus = (value: unknown): ImageStatus => {
  if (!isImageStatus(value)) {
    throw new OnPremApiError(
      'Unable to retrieve image build status due to an unexpected response',
    );
  }
  return value;
};

export const isUploadStatus = (value: unknown): value is UploadStatus => {
  return (
    isNonNullObject(value) &&
    'type' in value &&
    typeof value.type === 'string' &&
    'status' in value &&
    typeof value.status === 'string'
  );
};

export const assertUploadStatus = (value: unknown): UploadStatus => {
  if (!isUploadStatus(value)) {
    throw new OnPremApiError(
      'Unable to retrieve image upload status due to an unexpected response',
    );
  }
  return value;
};
