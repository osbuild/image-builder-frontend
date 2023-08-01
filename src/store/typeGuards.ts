import {
  AwsUploadRequestOptions,
  Awss3UploadStatus,
  AzureUploadRequestOptions,
  AzureUploadStatus,
  GcpUploadRequestOptions,
  GcpUploadStatus,
  UploadRequest,
  UploadStatus,
} from './imageBuilderApi';

export const isGcpUploadRequestOptions = (
  options: UploadRequest['options']
): options is GcpUploadRequestOptions => {
  return (options as GcpUploadRequestOptions).share_with_accounts !== undefined;
};

export const isAwsUploadRequestOptions = (
  options: UploadRequest['options']
): options is AwsUploadRequestOptions => {
  return true;
};

export const isAzureUploadRequestOptions = (
  options: UploadRequest['options']
): options is AzureUploadRequestOptions => {
  return (options as AzureUploadRequestOptions).resource_group !== undefined;
};

export const isGcpUploadStatus = (
  status: UploadStatus['options']
): status is GcpUploadStatus => {
  return (status as GcpUploadStatus).project_id !== undefined;
};

export const isAwss3UploadStatus = (
  status: UploadStatus['options']
): status is Awss3UploadStatus => {
  return (status as Awss3UploadStatus).url !== undefined;
};

export const isAzureUploadStatus = (
  status: UploadStatus['options']
): status is AzureUploadStatus => {
  return (status as AzureUploadStatus).image_name !== undefined;
};
