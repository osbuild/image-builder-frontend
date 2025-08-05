import path from 'path';

import { AWSWorkerConfig } from '../../../store/cockpit/types';

export const isAwsBucketValid = (bucket?: string): boolean => {
  if (!bucket || bucket === '') {
    return false;
  }

  const regex = /^[a-z0-9](?:[a-z0-9]|[-.](?=[a-z0-9])){1,61}[a-z0-9]$/;
  return regex.test(bucket);
};

export const isAwsCredsPathValid = (credsPath?: string): boolean => {
  if (!credsPath || credsPath === '') {
    return false;
  }

  const validPathPattern = /^(\/[^/\0]*)+\/?$/;
  return path.isAbsolute(credsPath) && validPathPattern.test(credsPath);
};

export const isAwsStepValid = (
  config: AWSWorkerConfig | undefined,
): boolean => {
  if (!config) {
    return true;
  }

  if (!config.bucket && !config.credentials) {
    return false;
  }

  return (
    isAwsBucketValid(config.bucket) && isAwsCredsPathValid(config.credentials)
  );
};
