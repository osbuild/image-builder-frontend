import type { RootState } from '@/store';

export const selectAWSConfig = (state: RootState) => {
  if (Object.keys(state.cloudConfig.aws).length === 0) {
    // just return undefined since the config is empty
    // and we don't want to save `[aws]` header to the
    // worker config file with no body
    return undefined;
  }
  return state.cloudConfig.aws;
};

export const selectAWSBucketName = (state: RootState) => {
  return state.cloudConfig.aws.bucket;
};

export const selectAWSProfile = (state: RootState) => {
  return state.cloudConfig.aws.profile;
};

export const selectAWSRegion = (state: RootState) => {
  return state.cloudConfig.aws.region;
};

export const selectAWSCredsPath = (state: RootState) => {
  return state.cloudConfig.aws.credentials;
};
