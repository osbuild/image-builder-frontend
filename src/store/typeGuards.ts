import {
  Awss3UploadStatus,
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  AzureUploadStatus,
  ComposesResponseItem,
  GcpUploadRequestOptions,
  GcpUploadStatus,
  ImageTypes,
  OciUploadStatus,
  UploadRequest,
  UploadStatus,
} from './api/backend/hosted';
// import from ./api/backend/onprem to break circular dependency
import { Bootc } from './api/backend/onprem';

import { targetOptions } from '../constants';

export const isGcpUploadRequestOptions = (
  _options: UploadRequest['options'],
): _options is GcpUploadRequestOptions => {
  return true;
};

export const isAwsUploadRequestOptions = (
  _options: UploadRequest['options'],
): _options is AwsUploadRequestOptions => {
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

export type ComposeWithBootc = ComposesResponseItem & {
  request: ComposesResponseItem['request'] & {
    bootc?: Bootc;
  };
};

export const hasBootcRequest = (
  compose: ComposesResponseItem,
): compose is ComposeWithBootc => {
  return 'bootc' in compose.request;
};

export const isImageType = (key: string): key is ImageTypes => {
  return key in targetOptions;
};
