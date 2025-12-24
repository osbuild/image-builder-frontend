import {
  Awss3UploadStatus,
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  AzureUploadStatus,
  GcpUploadRequestOptions,
  GcpUploadStatus,
  OciUploadStatus,
  UploadRequest,
  UploadStatus,
} from './imageBuilderApi';

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
