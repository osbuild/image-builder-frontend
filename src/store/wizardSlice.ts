import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Distributions, ImageRequest, ImageTypes } from './imageBuilderApi';

import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

type wizardState = {
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
  aws: {
    shareWithAccounts: string[];
    shareWithSources: string[];
  };
};

const initialState: wizardState = {
  architecture: X86_64,
  distribution: RHEL_9,
  imageTypes: [],
  aws: {
    shareWithAccounts: [],
    shareWithSources: [],
  },
};

export const selectArchitecture = (state: RootState) => {
  return state.wizard.architecture;
};

export const selectDistribution = (state: RootState) => {
  return state.wizard.distribution;
};

export const selectImageTypes = (state: RootState) => {
  return state.wizard.imageTypes;
};

export const selectAwsAccount = (state: RootState): string | undefined => {
  return state.wizard.aws.shareWithAccounts[0];
};

export const selectAwsSource = (state: RootState): string | undefined => {
  return state.wizard.aws.shareWithSources[0];
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.distribution = action.payload;
    },
    addImageType: (state, action: PayloadAction<ImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
      state.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<ImageTypes>) => {
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload
      );
    },
    changeImageTypes: (state, action: PayloadAction<ImageTypes[]>) => {
      state.imageTypes = action.payload;
    },
    changeAwsAccount: (state, action: PayloadAction<string>) => {
      state.aws.shareWithAccounts[0] = action.payload;
    },
    changeAwsSource: (state, action: PayloadAction<string>) => {
      state.aws.shareWithSources[0] = action.payload;
    },
    resetAws: (state) => {
      state.aws.shareWithAccounts = [];
      state.aws.shareWithSources = [];
    },
    resetAwsAccount: (state) => {
      state.aws.shareWithAccounts = [];
    },
    resetAwsSource: (state) => {
      state.aws.shareWithAccounts = [];
    },
  },
});

export const {
  initializeWizard,
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
  changeAwsAccount,
  changeAwsSource,
  resetAws,
  resetAwsAccount,
  resetAwsSource,
} = wizardSlice.actions;
export default wizardSlice.reducer;
