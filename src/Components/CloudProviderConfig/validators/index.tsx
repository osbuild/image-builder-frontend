import path from 'path';

import { AWSUploadConfig } from '@/store/api/backend';

export const isAwsBucketValid = (bucket?: string): boolean => {
  if (!bucket || bucket === '') {
    return false;
  }

  const regex = /^[a-z0-9](?:[a-z0-9]|[-.](?=[a-z0-9])){1,61}[a-z0-9]$/;
  return regex.test(bucket);
};

export const isAwsProfileValid = (profile?: string): boolean => {
  if (!profile || profile === '') {
    return false;
  }

  const regex = /^[a-z0-9](?:[a-z0-9]|[-.](?=[a-z0-9])){1,61}[a-z0-9]$/;
  return regex.test(profile);
};

export const isAwsCredsPathValid = (credsPath?: string): boolean => {
  if (!credsPath || credsPath === '') {
    return false;
  }

  const validPathPattern = /^(\/[^/\0]*)+\/?$/;
  return path.isAbsolute(credsPath) && validPathPattern.test(credsPath);
};

export const isAwsRegionValid = (region?: string): boolean => {
  if (!region || region === '') {
    return false;
  }

  const regex = /^[a-z0-9](?:[a-z0-9]|[-.](?=[a-z0-9])){1,61}[a-z0-9]$/;
  return regex.test(region);
};

export const isAwsStepValid = (
  config: AWSUploadConfig | undefined,
): boolean => {
  if (!config) {
    return true;
  }

  if (!config.bucket && !config.profile) {
    return false;
  }

  return (
    isAwsBucketValid(config.bucket) &&
    isAwsCredsPathValid(config.credentials) &&
    isAwsProfileValid(config.profile) &&
    isAwsRegionValid(config.region)
  );
};
