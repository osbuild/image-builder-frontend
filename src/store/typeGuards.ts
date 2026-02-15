import {
  Awss3UploadStatus,
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  AzureUploadStatus,
  Distributions,
  GcpUploadRequestOptions,
  GcpUploadStatus,
  ImageTypes,
  OciUploadStatus,
  UploadRequest,
  UploadStatus,
} from './imageBuilderApi';

import { IMAGE_MODE, targetOptions } from '../constants';

export const isGcpUploadRequestOptions = (
  options: UploadRequest['options'],
): options is GcpUploadRequestOptions => {
  return true;
};

export const isAwsUploadRequestOptions = (
  options: UploadRequest['options'],
): options is AwsUploadRequestOptions => {
  return true;
};

export const isAzureUploadRequestOptions = (
  options: UploadRequest['options'],
): options is AzureUploadRequestOptions => {
  return 'resource_group' in options;
};

export const isGcpUploadStatus = (
  status: UploadStatus['options'],
): status is GcpUploadStatus => {
  return 'project_id' in status;
};

export const isOciUploadStatus = (
  status: UploadStatus['options'],
): status is OciUploadStatus => {
  return 'url' in status;
};

export const isAwss3UploadStatus = (
  status: UploadStatus['options'],
): status is Awss3UploadStatus => {
  return 'url' in status;
};

export const isAzureUploadStatus = (
  status: UploadStatus['options'],
): status is AzureUploadStatus => {
  return 'image_name' in status;
};

export const isImageMode = (
  distribution?: Distributions | 'image-mode' | undefined,
): distribution is 'image-mode' => {
  return distribution === undefined || distribution === IMAGE_MODE;
};

// we added a dummy distribution, 'image-mode', for image-mode
// images on-prem. However this caused a number of type issues
// in the codebase, mostly in places that won't have image-mode
// support, but this typeguard is useful for managing this in
// one place
export const asDistribution = (
  distribution: Distributions | 'image-mode',
): Distributions => {
  if (isImageMode(distribution)) {
    throw new Error('Unexpected image-mode distribution');
  }
  return distribution;
};

export const isImageType = (key: string): key is ImageTypes => {
  return key in targetOptions;
};
