import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  DistributionProfileItem,
  Distributions,
  ImageRequest,
  ImageTypes,
  OpenScap,
} from './imageBuilderApi';

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
  profile: DistributionProfileItem;
  openScap: {
    profileId: OpenScap['profile_id'];
    profileName: OpenScap['profile_name'];
    profileDescription: OpenScap['profile_description'];
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
  profile: undefined,
  openScap: {
    profileId: 'None',
    profileName: undefined,
    profileDescription: undefined,
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

export const selectProfile = (state: RootState) => {
  return state.wizard.profile;
};

export const selectOscapProfileId = (state: RootState) => {
  return state.wizard.openScap.profileId;
};

export const selectOscapProfileName = (state: RootState) => {
  return state.wizard.openScap.profileName;
};

export const selectOscapProfileDescription = (state: RootState) => {
  return state.wizard.openScap.profileDescription;
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
    changeOscapProfile: (
      state,
      action: PayloadAction<DistributionProfileItem>
    ) => {
      state.profile = action.payload;
    },
    changeOscapProfileName: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.openScap.profileName = action.payload;
    },
    changeOscapProfileDescription: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.openScap.profileDescription = action.payload;
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
  changeOscapProfile,
  changeOscapProfileDescription,
  changeOscapProfileName,
} = wizardSlice.actions;
export default wizardSlice.reducer;
