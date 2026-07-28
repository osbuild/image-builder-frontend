import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { CloudProviderConfigState } from '@/store/api/backend';

const initialState: CloudProviderConfigState = {
  aws: {},
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
    changeAWSProfile: (state, action: PayloadAction<string>) => {
      state.aws.profile = action.payload;
    },
    changeAWSRegion: (state, action: PayloadAction<string>) => {
      state.aws.region = action.payload;
    },
    changeAWSCredsPath: (state, action: PayloadAction<string>) => {
      state.aws.credentials = action.payload;
    },
  },
});

export const {
  reinitializeAWSConfig,
  changeAWSBucketName,
  changeAWSProfile,
  changeAWSRegion,
  changeAWSCredsPath,
} = cloudProviderConfigSlice.actions;
