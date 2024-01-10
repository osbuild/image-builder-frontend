import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Distributions, ImageRequest, ImageTypes } from './imageBuilderApi';

import {
  AwsShareMethod,
  V1ListSourceResponseItem,
} from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Aws';
import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

type wizardState = {
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
  aws: {
    accountId: string | undefined;
    shareMethod: AwsShareMethod;
    source: V1ListSourceResponseItem | undefined;
  };
};

const initialState: wizardState = {
  architecture: X86_64,
  distribution: RHEL_9,
  imageTypes: [],
  aws: {
    accountId: undefined,
    shareMethod: 'sources',
    source: undefined,
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

export const selectAwsAccountId = (state: RootState): string | undefined => {
  return state.wizard.aws.accountId;
};

export const selectAwsSource = (
  state: RootState
): V1ListSourceResponseItem | undefined => {
  return state.wizard.aws.source;
};

export const selectAwsShareMethod = (state: RootState) => {
  return state.wizard.aws.shareMethod;
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
    changeAwsAccountId: (state, action: PayloadAction<string | undefined>) => {
      state.aws.accountId = action.payload;
    },
    changeAwsShareMethod: (state, action: PayloadAction<AwsShareMethod>) => {
      state.aws.shareMethod = action.payload;
    },
    changeAwsSource: (
      state,
      action: PayloadAction<V1ListSourceResponseItem | undefined>
    ) => {
      state.aws.source = action.payload;
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
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSource,
} = wizardSlice.actions;
export default wizardSlice.reducer;
