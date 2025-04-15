import path from 'path';

import {
  selectAWSBucketName,
  selectAWSCredsPath,
} from '../../../store/cloudProviderConfigSlice';
import { useAppSelector } from '../../../store/hooks';

export const useIsAwsBucketValid = (): boolean => {
  const bucket = useAppSelector(selectAWSBucketName);

  if (bucket === undefined || bucket === '') {
    return true;
  }

  const regex = /^[a-z0-9.-]{3,63}$/;
  return regex.test(bucket);
};

export const useIsAwsCredsPathValid = (): boolean => {
  const credsPath = useAppSelector(selectAWSCredsPath);

  if (credsPath === undefined || credsPath === '') {
    return true;
  }

  try {
    path.normalize(credsPath);
    return true;
  } catch {
    return false;
  }
};
