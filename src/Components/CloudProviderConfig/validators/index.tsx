import path from 'path';

export const isAwsBucketValid = (bucket: string): boolean => {
  const regex = /^[a-z0-9.-]{3,63}$/;
  return regex.test(bucket);
};

export const isAwsCredsPathValid = (credsPath: string): boolean => {
  const validPathPattern = /^(\/[^/\0]*)+\/?$/;
  return path.isAbsolute(credsPath) && validPathPattern.test(credsPath);
};
