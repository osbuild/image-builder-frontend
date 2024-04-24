import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { ApiRepositoryResponseRead } from './contentSourcesApi';
import {
  CustomRepository,
  DistributionProfileItem,
  Distributions,
  ImageRequest,
  ImageTypes,
  Repository,
} from './imageBuilderApi';
import { ActivationKeys } from './rhsmApi';

import { FileSystemPartitionMode } from '../Components/CreateImageWizardV2/steps/FileSystem';
import {
  Partition,
  Units,
} from '../Components/CreateImageWizardV2/steps/FileSystem/FileSystemConfiguration';
import { IBPackageWithRepositoryInfo } from '../Components/CreateImageWizardV2/steps/Packages/Packages';
import { AwsShareMethod } from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Aws';
import { AzureShareMethod } from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Azure';
import {
  GcpAccountType,
  GcpShareMethod,
} from '../Components/CreateImageWizardV2/steps/TargetEnvironment/Gcp';
import { getDuplicateMountPoints, isBlueprintNameValid, isMountpointMinSizeValid } from '../Components/CreateImageWizardV2/validators';
import { V1ListSourceResponseItem } from '../Components/CreateImageWizardV2/types';
import { RHEL_9, X86_64 } from '../constants';

import { RootState } from '.';

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc';

type StepValidation = {
  validated: 'default' | 'success' | 'error';
  errorText?: string | null;
  errors: {
    [key: string]: string[];
  };
};

export type wizardState = {
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
    sourceId?: string;
  };
  azure: {
    shareMethod: AzureShareMethod;
    tenantId: string;
    subscriptionId: string;
    source: string;
    resourceGroup: string;
  };
  gcp: {
    shareMethod: GcpShareMethod;
    accountType: GcpAccountType;
    email: string;
  };
  registration: {
    registrationType: RegistrationType;
    activationKey: ActivationKeys['name'];
  };
  openScap: {
    profile: DistributionProfileItem | undefined;
  };
  fileSystem: {
    mode: FileSystemPartitionMode;
    partitions: Partition[];
  };
  repositories: {
    customRepositories: CustomRepository[];
    payloadRepositories: Repository[];
    recommendedRepositories: ApiRepositoryResponseRead[];
  };
  packages: IBPackageWithRepositoryInfo[];
  details: {
    blueprintName: string;
    blueprintDescription: string;
  };
  stepValidations: {
    [key: string]: StepValidation;
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
  azure: {
    shareMethod: 'sources',
    tenantId: '',
    subscriptionId: '',
    source: '',
    resourceGroup: '',
  },
  gcp: {
    shareMethod: 'withGoogle',
    accountType: 'user',
    email: '',
  },
  registration: {
    registrationType: 'register-now-rhc',
    activationKey: undefined,
  },
  openScap: {
    profile: undefined,
  },
  fileSystem: {
    mode: 'automatic',
    partitions: [],
  },
  repositories: {
    customRepositories: [],
    payloadRepositories: [],
    recommendedRepositories: [],
  },
  packages: [],
  details: {
    blueprintName: '',
    blueprintDescription: '',
  },
  stepValidations: {},
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

export const selectAwsSourceId = (state: RootState): string | undefined => {
  return state.wizard.aws.sourceId;
};

export const selectAwsShareMethod = (state: RootState) => {
  return state.wizard.aws.shareMethod;
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.azure.tenantId;
};

export const selectAzureShareMethod = (state: RootState) => {
  return state.wizard.azure.shareMethod;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.azure.subscriptionId;
};

export const selectAzureSource = (state: RootState) => {
  return state.wizard.azure.source;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.azure.resourceGroup;
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

export const selectFileSystemPartitionMode = (state: RootState) => {
  return state.wizard.fileSystem.mode;
};

export const selectPartitions = (state: RootState) => {
  return state.wizard.fileSystem.partitions;
};

export const selectCustomRepositories = (state: RootState) => {
  return state.wizard.repositories.customRepositories;
};

export const selectPayloadRepositories = (state: RootState) => {
  return state.wizard.repositories.payloadRepositories;
};

export const selectRecommendedRepositories = (state: RootState) => {
  return state.wizard.repositories.recommendedRepositories;
};

export const selectPackages = (state: RootState) => {
  return state.wizard.packages;
};

export const selectBlueprintName = (state: RootState) => {
  return state.wizard.details.blueprintName;
};

export const selectBlueprintDescription = (state: RootState) => {
  return state.wizard.details.blueprintDescription;
};

export const selectIsValid = (state: RootState) => {
  return Object.values(state.wizard.stepValidations).every(
    (step) => step.validated === 'success'
  );
};

export const selectStepValidation = (stepId: string) => (state: RootState) => {
  return state.wizard.stepValidations[stepId]?.validated || 'default';
};

export const selectInputValidation =
  (stepId: string, inputId: string) => (state: RootState) => {
    const errors = state.wizard.stepValidations[stepId]?.errors?.[inputId];
    if (errors === undefined) return 'default';
    return errors.length === 0 ? 'success' : 'error';
  };

export const selectInputErrors =
  (stepId: string, inputId: string) => (state: RootState) => state.wizard.stepValidations[stepId]?.errors?.[inputId];

const validateFilesystemMinsize = (minSize: string): string[] => {
  if (!isMountpointMinSizeValid(minSize)) {
    return ['Invalid size'];
  }
  return [];
};

const validateFilesystemStep = (mode: FileSystemPartitionMode, partitions: Partition[]): StepValidation => {
  const errors: { [key: string]: string[] } = {};
  if (mode === 'automatic') {
    return { validated: 'success', errors };
  }

  const duplicates = getDuplicateMountPoints(partitions);
  let errorText = null;
  for (const partition of partitions) {
    errors[`min-size-${partition.id}`] = validateFilesystemMinsize(partition.min_size);
    if (duplicates.includes(partition.mountpoint)) {
      errors[`mountpoint-${partition.id}`] = ['Mount point already exists'];
      errorText = 'Duplicate mount points';
    }
  }
  return { validated: Object.values(errors).every((error) => error.length === 0) ? 'success' : 'error', errors, errorText };
};

const validateState = (state: wizardState) => {
  const isNameValid = isBlueprintNameValid(state.details.blueprintName);
  state.stepValidations = {
    'file-system': validateFilesystemStep(state.fileSystem.mode, state.fileSystem.partitions),
    'details': {validated: isNameValid ? 'success' : 'error', errors: {name: isNameValid ? [] : ['Invalid name']}},
  };
};

const setInputError = (stepValidation: StepValidation, inputId: string, errorText: string | undefined) => {
  if (errorText) {
    stepValidation.errors[inputId] = [errorText];
  }
  stepValidation.validated = Object.values(stepValidation.errors).every((error) => error.length === 0) ? 'success' : 'error';
};

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    loadWizardState: (state, action: PayloadAction<wizardState>) => {
      validateState(action.payload);
      return action.payload;
    },
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
    changeAwsSourceId: (state, action: PayloadAction<string | undefined>) => {
      state.aws.sourceId = action.payload;
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      state.azure.tenantId = action.payload;
    },
    changeAzureShareMethod: (
      state,
      action: PayloadAction<AzureShareMethod>
    ) => {
      state.azure.shareMethod = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      state.azure.subscriptionId = action.payload;
    },
    changeAzureSource: (state, action: PayloadAction<string>) => {
      state.azure.source = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      state.azure.resourceGroup = action.payload;
    },
    changeGcpShareMethod: (state, action: PayloadAction<GcpShareMethod>) => {
      switch (action.payload) {
        case 'withInsights':
          state.gcp.accountType = undefined;
          state.gcp.email = '';
          break;
        case 'withGoogle':
          state.gcp.accountType = 'user';
      }
      state.gcp.shareMethod = action.payload;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      state.gcp.accountType = action.payload;
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      state.gcp.email = action.payload;
    },
    changeRegistrationType: (
      state,
      action: PayloadAction<RegistrationType>
    ) => {
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

    changeFileSystemConfiguration: (
      state,
      action: PayloadAction<Partition[]>
    ) => {
      state.fileSystem.partitions = action.payload;
    },
    changeFileSystemPartitionMode: (
      state,
      action: PayloadAction<FileSystemPartitionMode>
    ) => {
      state.fileSystem.mode = action.payload;
      state.stepValidations["file-system"] = validateFilesystemStep(action.payload, state.fileSystem.partitions);
    },
    addPartition: (state, action: PayloadAction<Partition>) => {
      state.fileSystem.partitions.push(action.payload);
      state.stepValidations["file-system"] = validateFilesystemStep(state.fileSystem.mode, state.fileSystem.partitions);
    },
    removePartition: (state, action: PayloadAction<Partition['id']>) => {
      state.fileSystem.partitions.splice(
        state.fileSystem.partitions.findIndex(
          (partition) => partition.id === action.payload
        ),
        1
      );
      state.stepValidations["file-system"] = validateFilesystemStep(state.fileSystem.mode, state.fileSystem.partitions);
    },
    changePartitionOrder: (state, action: PayloadAction<string[]>) => {
      state.fileSystem.partitions = state.fileSystem.partitions.sort(
        (a, b) => action.payload.indexOf(a.id) - action.payload.indexOf(b.id)
      );
      state.stepValidations["file-system"] = validateFilesystemStep(state.fileSystem.mode, state.fileSystem.partitions);
    },
    changePartitionMountpoint: (
      state,
      action: PayloadAction<{ id: string; mountpoint: string }>
    ) => {
      const { id, mountpoint } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].mountpoint = mountpoint;
        state.stepValidations["file-system"] = validateFilesystemStep(state.fileSystem.mode, state.fileSystem.partitions);
      }
    },
    changePartitionUnit: (
      state,
      action: PayloadAction<{ id: string; unit: Units }>
    ) => {
      const { id, unit } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].unit = unit;
      }
    },
    changePartitionMinSize: (
      state,
      action: PayloadAction<{ id: string; min_size: string }>
    ) => {
      const { id, min_size } = action.payload;
      const partitionIndex = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === id
      );
      if (partitionIndex !== -1) {
        state.fileSystem.partitions[partitionIndex].min_size = min_size;
        state.stepValidations["file-system"] ||= { errors: {}, validated: 'default' };
        setInputError(state.stepValidations["file-system"], `min-size-${id}`, validateFilesystemMinsize(min_size)[0]);
      }
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>
    ) => {
      state.repositories.customRepositories = action.payload;
    },
    changePayloadRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.payloadRepositories = action.payload;
    },
    addRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>
    ) => {
      if (
        !state.repositories.recommendedRepositories.some(
          (repo) => repo.url === action.payload.url
        )
      ) {
        state.repositories.recommendedRepositories.push(action.payload);
      }
    },
    removeRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>
    ) => {
      state.repositories.recommendedRepositories =
        state.repositories.recommendedRepositories.filter(
          (repo) => repo.url !== action.payload.url
        );
    },
    addPackage: (state, action: PayloadAction<IBPackageWithRepositoryInfo>) => {
      state.packages.push(action.payload);
    },
    removePackage: (
      state,
      action: PayloadAction<IBPackageWithRepositoryInfo['name']>
    ) => {
      state.packages.splice(
        state.packages.findIndex((pkg) => pkg.name === action.payload),
        1
      );
    },
    clearOscapPackages: (state) => {
      state.packages = state.packages.filter(
        (pkg) => pkg.isRequiredByOpenScap !== true
      );
    },
    changeBlueprintName: (state, action: PayloadAction<string>) => {
      state.details.blueprintName = action.payload;
    },
    changeBlueprintDescription: (state, action: PayloadAction<string>) => {
      state.details.blueprintDescription = action.payload;
    },
    setStepInputValidation: (
      state,
      action: PayloadAction<{
        stepId: string;
        inputId: string;
        isValid: boolean;
        errorText: string | undefined;
      }>
    ) => {
      state.stepValidations[action.payload.stepId] ||= { errors: {}, validated: 'default' };
      if (!action.payload.isValid) {
        setInputError(state.stepValidations[action.payload.stepId], action.payload.inputId, action.payload.errorText);
      } else {
        setInputError(state.stepValidations[action.payload.stepId], action.payload.inputId, undefined);
      }
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
  changeAwsSourceId,
  changeAzureTenantId,
  changeAzureShareMethod,
  changeAzureSubscriptionId,
  changeAzureSource,
  changeAzureResourceGroup,
  changeGcpShareMethod,
  changeGcpAccountType,
  changeGcpEmail,
  changeRegistrationType,
  changeActivationKey,
  changeOscapProfile,
  changeFileSystemConfiguration,
  changeFileSystemPartitionMode,
  addPartition,
  removePartition,
  changePartitionMountpoint,
  changePartitionUnit,
  changePartitionMinSize,
  changePartitionOrder,
  changeCustomRepositories,
  changePayloadRepositories,
  addRecommendedRepository,
  removeRecommendedRepository,
  addPackage,
  removePackage,
  clearOscapPackages,
  changeBlueprintName,
  changeBlueprintDescription,
  loadWizardState,
  setStepInputValidation,
} = wizardSlice.actions;
export default wizardSlice.reducer;
