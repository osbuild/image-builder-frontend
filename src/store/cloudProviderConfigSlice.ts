import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { CloudProviderConfigState } from './cockpit/types';

import type { RootState } from '.';

export const initialState: CloudProviderConfigState = {
  aws: {},
};

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

export const selectAWSCredsPath = (state: RootState) => {
  return state.cloudConfig.aws.credentials;
};

export const cloudProviderConfigSlice = createSlice({
  name: 'cloudConfig',
  initialState,
  reducers: {
    reinitializeAWSConfig: (state) => {
      state.aws = {};
    },
    changeAWSBucketName: (state, action: PayloadAction<string>) => {
      state.aws.bucket = action.payload;
    },
    changeAWSCredsPath: (state, action: PayloadAction<string>) => {
      state.aws.credentials = action.payload;
    },
  },
});

export const {
  reinitializeAWSConfig,
  changeAWSBucketName,
  changeAWSCredsPath,
} = cloudProviderConfigSlice.actions;
