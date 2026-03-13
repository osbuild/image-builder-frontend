import { isNonNullObject, OnPremApiError } from '@/store/api/shared';

import { ComposeResponse, ComposeStatus } from '../hosted';

export const isComposeResponse = (value: unknown): value is ComposeResponse => {
  if (!isNonNullObject(value) || !('id' in value)) {
    return false;
  }
  return typeof value.id === 'string';
};

export const assertComposeResponse = (value: unknown): ComposeResponse => {
  if (!isComposeResponse(value)) {
    throw new OnPremApiError(
      'Image build request failed due to an unexpected response from the composer service',
    );
  }
  return value;
};

export const isComposeStatus = (value: unknown): value is ComposeStatus => {
  if (!isNonNullObject(value) || !('image_status' in value)) {
    return false;
  }
  const imageStatus = value.image_status;
  return (
    isNonNullObject(imageStatus) &&
    'status' in imageStatus &&
    typeof imageStatus.status === 'string'
  );
};

export const assertComposeStatus = (value: unknown): ComposeStatus => {
  if (!isComposeStatus(value)) {
    throw new OnPremApiError(
      'Unable to retrieve image build status due to an unexpected response',
    );
  }
  return value;
};
