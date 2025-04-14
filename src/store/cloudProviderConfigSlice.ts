import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '.';

export type cloudProviderConfigState = {
  aws?:
    | {
        bucket?: string;
        region?: string;
        credentials?: string;
      }
    | undefined;
};

export const initialState: cloudProviderConfigState = {
  aws: undefined,
};

export const selectAWSBucketName = (state: RootState) => {
  return state.cloudConfig?.aws?.bucket;
};

export const selectAWSRegion = (state: RootState) => {
  return state.cloudConfig?.aws?.region;
};

export const selectAWSCredsPath = (state: RootState) => {
  return state.cloudConfig?.aws?.credentials;
};

export const cloudProviderConfigSlice = createSlice({
  name: 'cloudConfig',
  initialState,
  reducers: {
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

export const { changeAWSBucketName, changeAWSRegion, changeAWSCredsPath } =
  cloudProviderConfigSlice.actions;
