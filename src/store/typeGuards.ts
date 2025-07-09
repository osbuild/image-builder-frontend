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
  options: UploadRequest['options']
): options is GcpUploadRequestOptions => {
  return true;
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

export const isOciUploadStatus = (
  status: UploadStatus['options']
): status is OciUploadStatus => {
  return (status as OciUploadStatus).url !== undefined;
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
