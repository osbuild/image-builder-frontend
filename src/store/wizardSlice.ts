import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  CustomRepository,
  DistributionProfileItem,
  Distributions,
  ImageRequest,
  ImageTypes,
} from './imageBuilderApi';
import { ActivationKeys } from './rhsmApi';

import {
  AwsShareMethod,
  V1ListSourceResponseItem,
} from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Aws';
import {
  GcpAccountType,
  GcpShareMethod,
} from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Gcp';
import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

type wizardState = {
  env: {
    serverUrl: string;
    baseUrl: string;
  };
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
  aws: {
    accountId: string;
    shareMethod: AwsShareMethod;
    source: V1ListSourceResponseItem | undefined;
  };
  gcp: {
    shareMethod: GcpShareMethod;
    accountType: GcpAccountType;
    email: string;
  };
  registration: {
    registrationType: string;
    activationKey: ActivationKeys['name'];
  };
  openScap: {
    profile: DistributionProfileItem | undefined;
    kernel: {
      kernelAppend: string | undefined;
    };
    services: {
      disabled: string[] | undefined;
      enabled: string[] | undefined;
    };
  };

  repositories: {
    customRepositories: CustomRepository[];
  };
  details: {
    blueprintName: string;
    blueprintDescription: string;
  };
};

const initialState: wizardState = {
  env: {
    serverUrl: '',
    baseUrl: '',
  },
  architecture: X86_64,
  distribution: RHEL_9,
  imageTypes: [],
  aws: {
    accountId: '',
    shareMethod: 'sources',
    source: undefined,
  },
  gcp: {
    shareMethod: 'withGoogle',
    accountType: 'google',
    email: '',
  },
  registration: {
    registrationType: 'register-now-rhc',
    activationKey: '',
  },
  openScap: {
    profile: undefined,
    kernel: {
      kernelAppend: '',
    },
    services: {
      disabled: [],
      enabled: [],
    },
  },
  repositories: {
    customRepositories: [],
  },
  details: {
    blueprintName: '',
    blueprintDescription: '',
  },
};

export const selectServerUrl = (state: RootState) => {
  return state.wizard.env.serverUrl;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.env.baseUrl;
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

export const selectAwsAccountId = (state: RootState): string => {
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

export const selectGcpShareMethod = (state: RootState) => {
  return state.wizard.gcp.shareMethod;
};

export const selectGcpAccountType = (state: RootState) => {
  return state.wizard.gcp.accountType;
};

export const selectGcpEmail = (state: RootState) => {
  return state.wizard.gcp.email;
};

export const selectRegistrationType = (state: RootState) => {
  return state.wizard.registration.registrationType;
};

export const selectActivationKey = (state: RootState) => {
  return state.wizard.registration.activationKey;
};

export const selectProfile = (state: RootState) => {
  return state.wizard.openScap.profile;
};

export const selectKernel = (state: RootState) => {
  return state.wizard.openScap.kernel.kernelAppend;
};

export const selectDisabledServices = (state: RootState) => {
  return state.wizard.openScap.services.disabled;
};

export const selectEnabledServices = (state: RootState) => {
  return state.wizard.openScap.services.enabled;
};

export const selectCustomRepositories = (state: RootState) => {
  return state.wizard.repositories.customRepositories;
};

export const selectBlueprintName = (state: RootState) => {
  return state.wizard.details.blueprintName;
};

export const selectBlueprintDescription = (state: RootState) => {
  return state.wizard.details.blueprintDescription;
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    changeServerUrl: (state, action: PayloadAction<string>) => {
      state.env.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      state.env.baseUrl = action.payload;
    },
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
    changeAwsAccountId: (state, action: PayloadAction<string>) => {
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
    changeGcpShareMethod: (state, action: PayloadAction<GcpShareMethod>) => {
      switch (action.payload) {
        case 'withInsights':
          state.gcp.accountType = undefined;
          state.gcp.email = '';
          break;
        case 'withGoogle':
          state.gcp.accountType = 'google';
      }
      state.gcp.shareMethod = action.payload;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      state.gcp.accountType = action.payload;
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      state.gcp.email = action.payload;
    },
    changeRegistrationType: (state, action: PayloadAction<string>) => {
      state.registration.registrationType = action.payload;
    },
    changeActivationKey: (
      state,
      action: PayloadAction<ActivationKeys['name']>
    ) => {
      state.registration.activationKey = action.payload;
    },
    changeOscapProfile: (
      state,
      action: PayloadAction<DistributionProfileItem | undefined>
    ) => {
      state.openScap.profile = action.payload;
    },

    changeKernel: (state, action: PayloadAction<string | undefined>) => {
      state.openScap.kernel.kernelAppend = action.payload;
    },
    changeDisabledServices: (
      state,
      action: PayloadAction<string[] | undefined>
    ) => {
      state.openScap.services.disabled = action.payload;
    },
    changeEnabledServices: (
      state,
      action: PayloadAction<string[] | undefined>
    ) => {
      state.openScap.services.enabled = action.payload;
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>
    ) => {
      state.repositories.customRepositories = action.payload;
    },
    changeBlueprintName: (state, action: PayloadAction<string>) => {
      state.details.blueprintName = action.payload;
    },
    changeBlueprintDescription: (state, action: PayloadAction<string>) => {
      state.details.blueprintDescription = action.payload;
    },
  },
});

export const {
  initializeWizard,
  changeServerUrl,
  changeBaseUrl,
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSource,
  changeGcpShareMethod,
  changeGcpAccountType,
  changeGcpEmail,
  changeRegistrationType,
  changeActivationKey,
  changeOscapProfile,
  changeKernel,
  changeDisabledServices,
  changeEnabledServices,
  changeCustomRepositories,
  changeBlueprintName,
  changeBlueprintDescription,
} = wizardSlice.actions;
export default wizardSlice.reducer;
