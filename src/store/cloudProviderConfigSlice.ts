import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type {
  AWSWorkerConfig,
  CloudProviderConfigState,
} from './cockpit/types';

import type { RootState } from '.';

export const initialState: CloudProviderConfigState = {
  aws: undefined,
};

export const selectAWSConfig = (state: RootState) => {
  return state.cloudConfig.aws;
};

export const selectAWSBucketName = (state: RootState) => {
  return state.cloudConfig.aws?.bucket;
};

export const selectAWSRegion = (state: RootState) => {
  return state.cloudConfig.aws?.region;
};

export const selectAWSCredsPath = (state: RootState) => {
  return state.cloudConfig.aws?.credentials;
};

export const cloudProviderConfigSlice = createSlice({
  name: 'cloudConfig',
  initialState,
  reducers: {
    changeAWSConfig: (state, action: PayloadAction<AWSWorkerConfig>) => {
      state.aws = action.payload;
    },
    changeAWSBucketName: (state, action: PayloadAction<string>) => {
      if (state.aws === undefined) {
        state.aws = {};
      }
      state.aws.bucket = action.payload;
    },
    changeAWSRegion: (state, action: PayloadAction<string>) => {
      if (state.aws === undefined) {
        state.aws = {};
      }
      state.aws.region = action.payload;
    },
    changeAWSCredsPath: (state, action: PayloadAction<string>) => {
      if (state.aws === undefined) {
        state.aws = {};
      }
      state.aws.credentials = action.payload;
    },
  },
});

export const {
  changeAWSConfig,
  changeAWSBucketName,
  changeAWSRegion,
  changeAWSCredsPath,
} = cloudProviderConfigSlice.actions;
