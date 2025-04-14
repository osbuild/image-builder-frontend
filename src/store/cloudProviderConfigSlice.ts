import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '.';

export type cloudProviderConfigState = {
  aws: {
    bucket?: string;
    credentials?: string;
  };
};

export const initialState: cloudProviderConfigState = {
  aws: {},
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
    changeAWSBucketName: (state, action: PayloadAction<string>) => {
      state.aws.bucket = action.payload;
    },
    changeAWSCredsPath: (state, action: PayloadAction<string>) => {
      state.aws.credentials = action.payload;
    },
  },
});

export const { changeAWSBucketName, changeAWSCredsPath } =
  cloudProviderConfigSlice.actions;
