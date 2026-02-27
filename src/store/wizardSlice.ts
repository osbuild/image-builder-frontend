import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import type { ApiRepositoryResponseRead } from './contentSourcesApi';
import type {
  CustomRepository,
  Distributions,
  ImageRequest,
  ImageTypes,
  Locale,
  LogicalVolume,
  Module,
  Repository,
  Timezone,
  User,
} from './imageBuilderApi';
import type { ActivationKeys } from './rhsmApi';

import type { FscModeType } from '../Components/CreateImageWizard/steps/FileSystem';
import type {
  DiskPartition,
  DiskPartitionBase,
  FilesystemPartition,
  FscDisk,
  FSType,
  PartitioningCustomization,
  Units,
} from '../Components/CreateImageWizard/steps/FileSystem/fscTypes';
import type {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '../Components/CreateImageWizard/steps/Packages/Packages';
import type { AwsShareMethod } from '../Components/CreateImageWizard/steps/TargetEnvironment/Aws';
import type {
  GcpAccountType,
  GcpShareMethod,
} from '../Components/CreateImageWizard/steps/TargetEnvironment/Gcp';
import type { V1ListSourceResponseItem } from '../Components/CreateImageWizard/types';
import { generateDefaultName } from '../Components/CreateImageWizard/utilities/useGenerateDefaultName';
import { RHEL_10, X86_64 } from '../constants';
import isRhel from '../Utilities/isRhel';
import { yyyyMMddFormat } from '../Utilities/time';

import type { RootState } from '.';

// Group ID constants based on Linux LOGIN.DEFS(5) defaults
// GID_MIN: minimum group ID for regular groups (default: 1000)
// GID_MAX: maximum group ID for regular groups (default: 60000)
const MIN_GROUP_ID = 1000;
const MAX_GROUP_ID = 60000;

type WizardModeOptions = 'create' | 'edit';

export type BlueprintModeOptions = 'image' | 'package';

export type ImageSource = string;

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc'
  | 'register-satellite'
  | 'register-aap';

export type PartitioningModeType = ('raw' | 'lvm' | 'auto-lvm') | undefined;

export type ComplianceType = 'openscap' | 'compliance';

export type UserWithAdditionalInfo = {
  [K in keyof User]-?: NonNullable<User[K]>;
} & {
  isAdministrator: boolean;
};

type UserPayload = {
  index: number;
  name: string;
};

type UserPasswordPayload = {
  index: number;
  password: string;
};

type UserSshKeyPayload = {
  index: number;
  sshKey: string;
};

type UserAdministratorPayload = {
  index: number;
  isAdministrator: boolean;
};

type UserGroupPayload = {
  index: number;
  group: string;
};

type UserGroupNamePayload = {
  index: number;
  name: string;
};

export type UserGroup = {
  name: string;
  gid?: number;
};

export type wizardState = {
  env: {
    serverUrl: string;
    baseUrl: string;
    proxy: string | undefined;
  };
  blueprintId?: string;
  wizardMode: WizardModeOptions;
  blueprintMode: BlueprintModeOptions;
  imageSource?: ImageSource | undefined;
  architecture: ImageRequest['architecture'];
  distribution: Distributions | 'image-mode';
  imageTypes: ImageTypes[];
  aapRegistration: {
    callbackUrl: string | undefined;
    hostConfigKey: string | undefined;
    tlsCertificateAuthority: string | undefined;
    skipTlsVerification: boolean | undefined;
  };
  aws: {
    accountId: string;
    shareMethod: AwsShareMethod;
    source: V1ListSourceResponseItem | undefined;
    sourceId?: string | undefined;
    region?: string | undefined;
  };
  azure: {
    tenantId: string | undefined;
    subscriptionId: string | undefined;
    resourceGroup: string | undefined;
    hyperVGeneration: 'V1' | 'V2';
  };
  gcp: {
    shareMethod: GcpShareMethod;
    accountType: GcpAccountType;
    email: string;
  };
  registration: {
    registrationType: RegistrationType;
    activationKey: ActivationKeys['name'];
    orgId: string | undefined;
    satelliteRegistration: {
      command: string | undefined;
      caCert: string | undefined;
    };
  };
  compliance: {
    complianceType: ComplianceType;
    policyID: string | undefined;
    profileID: string | undefined;
    policyTitle: string | undefined;
  };
  fscMode: FscModeType;
  disk: FscDisk;
  fileSystem: {
    partitions: FilesystemPartition[];
  };
  partitioning_mode: PartitioningModeType;
  snapshotting: {
    useLatest: boolean;
    snapshotDate: string;
    template: string;
    templateName: string;
  };
  users: UserWithAdditionalInfo[];
  userGroups: UserGroup[];
  firstBoot: {
    script: string;
  };
  repositories: {
    customRepositories: CustomRepository[];
    payloadRepositories: Repository[];
    recommendedRepositories: ApiRepositoryResponseRead[];
    redHatRepositories: Repository[];
  };
  packages: IBPackageWithRepositoryInfo[];
  enabled_modules: Module[];
  groups: GroupWithRepositoryInfo[];
  services: {
    enabled: string[];
    masked: string[];
    disabled: string[];
  };
  kernel: {
    name: string;
    append: string[];
  };
  locale: Locale;
  details: {
    blueprintName: string;
    isCustomName: boolean;
    blueprintDescription: string;
  };
  timezone: Timezone;
  hostname: string;
  firewall: {
    ports: string[];
    services: {
      enabled: string[];
      disabled: string[];
    };
  };
  fips: {
    enabled: boolean;
  };
  metadata?: {
    parent_id: string | null;
    exported_at: string;
    is_on_prem: boolean;
  };
};

export const initialState: wizardState = {
  env: {
    serverUrl: '',
    baseUrl: '',
    proxy: undefined,
  },
  wizardMode: 'create',
  blueprintMode: 'package',
  architecture: X86_64,
  distribution: RHEL_10,
  imageTypes: [],
  aapRegistration: {
    callbackUrl: undefined,
    hostConfigKey: undefined,
    tlsCertificateAuthority: undefined,
    skipTlsVerification: undefined,
  },
  aws: {
    accountId: '',
    shareMethod: 'manual',
    source: undefined,
    region: 'us-east-1',
  },
  azure: {
    tenantId: undefined,
    subscriptionId: undefined,
    resourceGroup: undefined,
    hyperVGeneration: 'V2',
  },
  gcp: {
    shareMethod: 'withGoogle',
    accountType: 'user',
    email: '',
  },
  registration: {
    registrationType: 'register-now-rhc',
    activationKey: undefined,
    orgId: undefined,
    satelliteRegistration: {
      command: undefined,
      caCert: undefined,
    },
  },
  compliance: {
    complianceType: 'openscap',
    policyID: undefined,
    profileID: undefined,
    policyTitle: undefined,
  },
  fscMode: 'automatic',
  disk: {
    minsize: '',
    partitions: [],
    type: undefined,
  },
  fileSystem: {
    partitions: [],
  },
  partitioning_mode: undefined,
  snapshotting: {
    useLatest: true,
    snapshotDate: '',
    template: '',
    templateName: '',
  },
  repositories: {
    customRepositories: [],
    payloadRepositories: [],
    recommendedRepositories: [],
    redHatRepositories: [],
  },
  packages: [],
  enabled_modules: [],
  groups: [],
  services: {
    enabled: [],
    masked: [],
    disabled: [],
  },
  kernel: {
    name: '',
    append: [],
  },
  locale: {
    languages: ['C.UTF-8'],
    keyboard: '',
  },
  details: {
    blueprintName: generateDefaultName(RHEL_10, X86_64),
    isCustomName: false,
    blueprintDescription: '',
  },
  timezone: {
    timezone: '',
    ntpservers: [],
  },
  hostname: '',
  firewall: {
    ports: [],
    services: {
      enabled: [],
      disabled: [],
    },
  },
  fips: {
    enabled: false,
  },
  firstBoot: { script: '' },
  users: [],
  userGroups: [{ name: '' }],
};

export const selectServerUrl = (state: RootState) => {
  return state.wizard.env.serverUrl;
};

export const selectWizardMode = (state: RootState) => {
  return state.wizard.wizardMode;
};

export const selectBlueprintMode = (state: RootState) => {
  return state.wizard.blueprintMode;
};

export const selectImageSource = (state: RootState) => {
  return state.wizard.imageSource;
};

export const selectBlueprintId = (state: RootState) => {
  return state.wizard.blueprintId;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.env.baseUrl;
};

export const selectProxy = (state: RootState) => {
  return state.wizard.env.proxy;
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

export const selectAwsRegion = (state: RootState) => {
  return state.wizard.aws.region;
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.azure.tenantId;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.azure.subscriptionId;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.azure.resourceGroup;
};

export const selectAzureHyperVGeneration = (state: RootState) => {
  return state.wizard.azure.hyperVGeneration;
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

export const selectOrgId = (state: RootState) => {
  return state.wizard.registration.orgId;
};

export const selectSatelliteRegistrationCommand = (state: RootState) => {
  return state.wizard.registration.satelliteRegistration.command;
};

export const selectSatelliteCaCertificate = (state: RootState) => {
  return state.wizard.registration.satelliteRegistration.caCert;
};

export const selectAapRegistration = (state: RootState) => {
  return state.wizard.aapRegistration;
};

export const selectAapCallbackUrl = (state: RootState) => {
  return state.wizard.aapRegistration.callbackUrl;
};

export const selectAapHostConfigKey = (state: RootState) => {
  return state.wizard.aapRegistration.hostConfigKey;
};

export const selectAapTlsCertificateAuthority = (state: RootState) => {
  return state.wizard.aapRegistration.tlsCertificateAuthority;
};

export const selectAapTlsConfirmation = (state: RootState) => {
  return state.wizard.aapRegistration.skipTlsVerification;
};

export const selectComplianceProfileID = (state: RootState) => {
  return state.wizard.compliance.profileID;
};

export const selectCompliancePolicyID = (state: RootState) => {
  return state.wizard.compliance.policyID;
};

export const selectCompliancePolicyTitle = (state: RootState) => {
  return state.wizard.compliance.policyTitle;
};

export const selectComplianceType = (state: RootState) => {
  return state.wizard.compliance.complianceType;
};

export const selectFscMode = (state: RootState) => {
  return state.wizard.fscMode;
};

export const selectDiskType = (state: RootState) => {
  return state.wizard.disk.type;
};

export const selectDiskMinsize = (state: RootState) => {
  return state.wizard.disk.minsize;
};

export const selectDiskPartitions = (state: RootState) => {
  return state.wizard.disk.partitions;
};

export const selectFilesystemPartitions = (state: RootState) => {
  return state.wizard.fileSystem.partitions;
};

export const selectPartitioningMode = (state: RootState) => {
  return state.wizard.partitioning_mode;
};

export const selectUseLatest = (state: RootState) => {
  return state.wizard.snapshotting.useLatest;
};

export const selectSnapshotDate = (state: RootState) => {
  return state.wizard.snapshotting.snapshotDate;
};

export const selectTemplate = (state: RootState) => {
  return state.wizard.snapshotting.template;
};

export const selectTemplateName = (state: RootState) => {
  return state.wizard.snapshotting.templateName;
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

export const selectRedHatRepositories = (state: RootState) => {
  return state.wizard.repositories.redHatRepositories;
};

export const selectPackages = (state: RootState) => {
  return state.wizard.packages;
};

export const selectModules = (state: RootState) => {
  return state.wizard.enabled_modules;
};

export const selectGroups = (state: RootState) => {
  return state.wizard.groups;
};

export const selectServices = (state: RootState) => {
  return state.wizard.services;
};

export const selectUsers = (state: RootState) => {
  return state.wizard.users;
};

export const selectUserGroups = (state: RootState) => {
  return state.wizard.userGroups;
};

export const selectKernel = (state: RootState) => {
  return state.wizard.kernel;
};

export const selectLanguages = (state: RootState) => {
  return state.wizard.locale.languages;
};

export const selectKeyboard = (state: RootState) => {
  return state.wizard.locale.keyboard;
};

export const selectBlueprintName = (state: RootState) => {
  return state.wizard.details.blueprintName;
};

export const selectIsCustomName = (state: RootState) => {
  return state.wizard.details.isCustomName;
};

export const selectMetadata = (state: RootState) => {
  return state.wizard.metadata;
};

export const selectBlueprintDescription = (state: RootState) => {
  return state.wizard.details.blueprintDescription;
};

export const selectFirstBootScript = (state: RootState) => {
  return state.wizard.firstBoot.script;
};

export const selectTimezone = (state: RootState) => {
  return state.wizard.timezone.timezone;
};

export const selectNtpServers = (state: RootState) => {
  return state.wizard.timezone.ntpservers;
};

export const selectHostname = (state: RootState) => {
  return state.wizard.hostname;
};

export const selectFirewall = (state: RootState) => {
  return state.wizard.firewall;
};

export const selectFips = (state: RootState) => {
  return state.wizard.fips;
};

// Derived selector for checking if we're in image mode
export const selectIsImageMode = createSelector(
  [selectBlueprintMode],
  (mode) => mode === 'image',
);

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    initializeWizard: () => initialState,
    loadWizardState: (state, action: PayloadAction<wizardState>) =>
      action.payload,
    changeServerUrl: (state, action: PayloadAction<string>) => {
      state.env.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      state.env.baseUrl = action.payload;
    },
    changeProxy: (state, action: PayloadAction<string | undefined>) => {
      state.env.proxy = action.payload;
    },
    changeBlueprintMode: (
      state,
      action: PayloadAction<BlueprintModeOptions>,
    ) => {
      state.blueprintMode = action.payload;
    },
    changeImageSource: (
      state,
      action: PayloadAction<ImageSource | undefined>,
    ) => {
      state.imageSource = action.payload;
    },
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>,
    ) => {
      state.architecture = action.payload;
    },
    changeDistribution: (
      state,
      action: PayloadAction<Distributions | 'image-mode'>,
    ) => {
      state.distribution = action.payload;

      if (process.env.IS_ON_PREMISE && !isRhel(action.payload)) {
        state.registration.registrationType = 'register-later';
      }
    },
    addImageType: (state, action: PayloadAction<ImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload,
      );
      state.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<ImageTypes>) => {
      state.imageTypes = state.imageTypes.filter(
        (imageType) => imageType !== action.payload,
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
    changeAwsRegion: (state, action: PayloadAction<string | undefined>) => {
      state.aws.region = action.payload;
    },
    reinitializeAws: (state) => {
      state.aws.accountId = '';
      state.aws.shareMethod = 'manual';
      state.aws.source = undefined;
      state.aws.region = 'us-east-1';
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      state.azure.tenantId = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      state.azure.subscriptionId = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      state.azure.resourceGroup = action.payload;
    },
    changeAzureHyperVGeneration: (
      state,
      action: PayloadAction<'V1' | 'V2'>,
    ) => {
      state.azure.hyperVGeneration = action.payload;
    },
    reinitializeAzure: (state) => {
      state.azure.tenantId = undefined;
      state.azure.subscriptionId = undefined;
      state.azure.resourceGroup = undefined;
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
    reinitializeGcp: (state) => {
      state.gcp.shareMethod = 'withGoogle';
      state.gcp.accountType = 'user';
      state.gcp.email = '';
    },
    changeRegistrationType: (
      state,
      action: PayloadAction<RegistrationType>,
    ) => {
      state.registration.registrationType = action.payload;
    },
    changeSatelliteRegistrationCommand: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.registration.satelliteRegistration.command = action.payload;
    },
    changeSatelliteCaCertificate: (state, action: PayloadAction<string>) => {
      state.registration.satelliteRegistration.caCert = action.payload;
    },
    changeAapCallbackUrl: (state, action: PayloadAction<string>) => {
      state.aapRegistration.callbackUrl = action.payload;
    },

    changeAapHostConfigKey: (state, action: PayloadAction<string>) => {
      state.aapRegistration.hostConfigKey = action.payload;
    },
    changeAapTlsCertificateAuthority: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.aapRegistration.tlsCertificateAuthority = action.payload;
    },
    changeAapTlsConfirmation: (state, action: PayloadAction<boolean>) => {
      state.aapRegistration.skipTlsVerification = action.payload;
    },
    changeActivationKey: (
      state,
      action: PayloadAction<ActivationKeys['name']>,
    ) => {
      state.registration.activationKey = action.payload;
    },
    changeOrgId: (state, action: PayloadAction<string>) => {
      state.registration.orgId = action.payload;
    },
    changeComplianceType: (state, action: PayloadAction<ComplianceType>) => {
      state.compliance.complianceType = action.payload;
    },
    setCompliancePolicy: (
      state,
      action: PayloadAction<{
        policyID: string | undefined;
        policyTitle: string | undefined;
      }>,
    ) => {
      state.compliance.policyID = action.payload.policyID;
      state.compliance.policyTitle = action.payload.policyTitle;
    },
    setOscapProfile: (state, action: PayloadAction<string | undefined>) => {
      state.compliance.profileID = action.payload;
    },
    changeFileSystemConfiguration: (
      state,
      action: PayloadAction<FilesystemPartition[]>,
    ) => {
      state.fileSystem.partitions = action.payload;
    },
    changeFscMode: (state, action: PayloadAction<FscModeType>) => {
      const currentMode = state.fscMode;

      // Only trigger if mode is being *changed*
      if (currentMode !== action.payload) {
        state.fscMode = action.payload;
        switch (action.payload) {
          case 'automatic':
            state.fileSystem.partitions = [];
            break;
          case 'basic':
            state.fileSystem.partitions = [
              {
                id: uuidv4(),
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ];
            break;
          case 'advanced':
            state.disk.partitions = [
              {
                id: uuidv4(),
                mountpoint: '/',
                fs_type: 'xfs',
                min_size: '1',
                unit: 'GiB',
                type: 'plain',
              },
            ];
            break;
        }
      }
    },
    clearPartitions: (state) => {
      const currentMode = state.fscMode;

      if (currentMode === 'basic') {
        state.fileSystem.partitions = [
          {
            id: uuidv4(),
            mountpoint: '/',
            min_size: '10',
            unit: 'GiB',
          },
        ];
      }
    },
    addPartition: (state, action: PayloadAction<FilesystemPartition>) => {
      // Duplicate partitions are allowed temporarily, the wizard is responsible for final validation
      state.fileSystem.partitions.push(action.payload);
    },
    removePartition: (
      state,
      action: PayloadAction<FilesystemPartition['id']>,
    ) => {
      const index = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === action.payload,
      );
      if (index !== -1) {
        state.fileSystem.partitions.splice(index, 1);
      }
    },
    removePartitionByMountpoint: (
      state,
      action: PayloadAction<FilesystemPartition['mountpoint']>,
    ) => {
      const index = state.fileSystem.partitions.findIndex(
        (partition) => partition.mountpoint === action.payload,
      );
      if (index !== -1) {
        state.fileSystem.partitions.splice(index, 1);
      }
    },
    changePartitionOrder: (state, action: PayloadAction<string[]>) => {
      state.fileSystem.partitions = state.fileSystem.partitions.sort(
        (a, b) => action.payload.indexOf(a.id) - action.payload.indexOf(b.id),
      );
    },
    changePartitionMountpoint: (
      state,
      action: PayloadAction<{
        id: string;
        mountpoint: string;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, mountpoint, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );

      if (partitionIndex !== -1) {
        if ('mountpoint' in state[customization].partitions[partitionIndex]) {
          state[customization].partitions[partitionIndex].mountpoint =
            mountpoint;
          return;
        }
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].mountpoint =
              mountpoint;
          }
        }
      }
    },
    changePartitionUnit: (
      state,
      action: PayloadAction<{
        id: string;
        unit: Units;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, unit, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state[customization].partitions[partitionIndex].unit = unit;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].unit = unit;
          }
        }
      }
    },
    changePartitionMinSize: (
      state,
      action: PayloadAction<{
        id: string;
        min_size: string;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, min_size, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state[customization].partitions[partitionIndex].min_size = min_size;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].min_size = min_size;
          }
        }
      }
    },
    changePartitionType: (
      state,
      action: PayloadAction<{
        id: string;
        fs_type: FSType;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, fs_type, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'fs_type' in state[customization].partitions[partitionIndex]
      ) {
        state[customization].partitions[partitionIndex].fs_type = fs_type;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].fs_type = fs_type;
          }
        }
      }
    },
    changePartitionName: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, name, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'name' in state[customization].partitions[partitionIndex]
      ) {
        state[customization].partitions[partitionIndex].name = name;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].name = name;
          }
        }
      }
    },
    changeDiskMinsize: (state, action: PayloadAction<string>) => {
      state.disk.minsize = action.payload;
    },
    changeDiskType: (
      state,
      action: PayloadAction<'gpt' | 'dos' | undefined>,
    ) => {
      state.disk.type = action.payload;
    },
    addDiskPartition: (state, action: PayloadAction<DiskPartition>) => {
      state.disk.partitions.push(action.payload);
    },
    removeDiskPartition: (
      state,
      action: PayloadAction<DiskPartition['id']>,
    ) => {
      const index = state.disk.partitions.findIndex(
        (partition) => partition.id === action.payload,
      );
      if (index !== -1) {
        state.disk.partitions.splice(index, 1);
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === action.payload,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes.splice(logicalVolumeIndex, 1);
          }
        }
      }
    },
    changeDiskPartitionMinsize: (
      state,
      action: PayloadAction<{ id: string; min_size: string }>,
    ) => {
      const { id, min_size } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state.disk.partitions[partitionIndex].min_size = min_size;
      }
    },
    changeDiskPartitionName: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      const { id, name } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'name' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].name = name;
      }
    },
    addLogicalVolumeToVolumeGroup: (
      state,
      action: PayloadAction<{
        vgId: string;
        logicalVolume: LogicalVolume & DiskPartitionBase;
      }>,
    ) => {
      const { vgId, logicalVolume } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === vgId,
      );
      if (
        partitionIndex !== -1 &&
        'logical_volumes' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].logical_volumes.push(
          logicalVolume,
        );
      }
    },
    changePartitioningMode: (
      state,
      action: PayloadAction<PartitioningModeType>,
    ) => {
      state.partitioning_mode = action.payload;
    },
    changeUseLatest: (state, action: PayloadAction<boolean>) => {
      if (!action.payload && state.snapshotting.snapshotDate === '') {
        state.snapshotting.snapshotDate = `${yyyyMMddFormat(new Date())}T00:00:00.000Z`;
      }

      state.snapshotting.useLatest = action.payload;
    },
    changeSnapshotDate: (state, action: PayloadAction<string>) => {
      // Store DatePicker's YYYY-MM-DD format as RFC3339 e.g. "2025-11-26T00:00:00.000Z" in state
      const yyyyMMDDRegex = /^\d{4}-\d{2}-\d{2}$/;
      const date = new Date(action.payload);
      if (yyyyMMDDRegex.test(action.payload) && !isNaN(date.getTime())) {
        state.snapshotting.snapshotDate = date.toISOString();
      } else {
        // For empty strings or already-ISO formatted strings, store as-is
        state.snapshotting.snapshotDate = action.payload;
      }
    },
    changeTemplate: (state, action: PayloadAction<string>) => {
      state.snapshotting.template = action.payload;
    },
    changeTemplateName: (state, action: PayloadAction<string>) => {
      state.snapshotting.templateName = action.payload;
    },
    importCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.repositories.customRepositories = [
        ...state.repositories.customRepositories,
        ...action.payload,
      ];
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.repositories.customRepositories = action.payload;
    },
    changePayloadRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.payloadRepositories = action.payload;
    },
    changeRedHatRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.repositories.redHatRepositories = action.payload;
    },
    addRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      if (
        !state.repositories.recommendedRepositories.some(
          (repo) => repo.url === action.payload.url,
        )
      ) {
        state.repositories.recommendedRepositories.push(action.payload);
      }
    },
    removeRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      state.repositories.recommendedRepositories =
        state.repositories.recommendedRepositories.filter(
          (repo) => repo.url !== action.payload.url,
        );
    },
    addPackage: (state, action: PayloadAction<IBPackageWithRepositoryInfo>) => {
      const existingPackageIndex = state.packages.findIndex(
        (pkg) => pkg.name === action.payload.name,
      );

      if (existingPackageIndex !== -1) {
        state.packages[existingPackageIndex] = action.payload;
      } else {
        state.packages.push(action.payload);
      }
    },
    removePackage: (
      state,
      action: PayloadAction<IBPackageWithRepositoryInfo['name']>,
    ) => {
      const index = state.packages.findIndex(
        (pkg) => pkg.name === action.payload,
      );
      if (index !== -1) {
        state.packages.splice(index, 1);
      }
    },
    addModule: (state, action: PayloadAction<Module>) => {
      const existingModuleIndex = state.enabled_modules.findIndex(
        (module) => module.name === action.payload.name,
      );

      if (existingModuleIndex !== -1) {
        state.enabled_modules[existingModuleIndex] = action.payload;
      } else {
        state.enabled_modules.push(action.payload);
      }
    },
    removeModule: (state, action: PayloadAction<Module['name']>) => {
      const index = state.enabled_modules.findIndex(
        (module) => module.name === action.payload,
      );
      // count other packages from the same module
      const pkgCount = state.packages.filter(
        (pkg) => pkg.module_name === action.payload,
      );
      // if the module exists and it's not connected to any packages, remove it
      if (index !== -1 && pkgCount.length < 1) {
        state.enabled_modules.splice(index, 1);
      }
    },
    addPackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo>,
    ) => {
      const existingGrpIndex = state.groups.findIndex(
        (grp) => grp.name === action.payload.name,
      );

      if (existingGrpIndex !== -1) {
        state.groups[existingGrpIndex] = action.payload;
      } else {
        state.groups.push(action.payload);
      }
    },
    removePackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo['name']>,
    ) => {
      const index = state.groups.findIndex(
        (grp) => grp.name === action.payload,
      );
      if (index !== -1) {
        state.groups.splice(index, 1);
      }
    },
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.locale.languages &&
        !state.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.locale.languages) {
        const index = state.locale.languages.findIndex(
          (lang) => lang === action.payload,
        );
        if (index !== -1) {
          state.locale.languages.splice(index, 1);
        }
      }
    },
    clearLanguages: (state) => {
      state.locale.languages = [];
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.locale.keyboard = action.payload;
    },
    changeBlueprintName: (state, action: PayloadAction<string>) => {
      state.details.blueprintName = action.payload;
    },
    setIsCustomName: (state) => {
      state.details.isCustomName = true;
    },
    changeBlueprintDescription: (state, action: PayloadAction<string>) => {
      state.details.blueprintDescription = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      state.firstBoot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.enabled.some((service) => service === action.payload)
      ) {
        state.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.enabled.splice(index, 1);
      }
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.masked.some((service) => service === action.payload)
      ) {
        state.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      const index = state.services.masked.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.masked.splice(index, 1);
      }
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.disabled.some((service) => service === action.payload)
      ) {
        state.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.disabled.splice(index, 1);
      }
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.kernel.append.findIndex(
        (arg) => arg === action.payload,
      );

      if (existingArgIndex !== -1) {
        state.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.kernel.append.length > 0) {
        const index = state.kernel.append.findIndex(
          (arg) => arg === action.payload,
        );
        if (index !== -1) {
          state.kernel.append.splice(index, 1);
        }
      }
    },
    clearKernelAppend: (state) => {
      state.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.enabled.splice(index, 1);
      }
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.disabled.splice(index, 1);
      }
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.timezone.ntpservers?.some((server) => server === action.payload)
      ) {
        state.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      if (state.timezone.ntpservers) {
        const index = state.timezone.ntpservers.findIndex(
          (server) => server === action.payload,
        );
        if (index !== -1) {
          state.timezone.ntpservers.splice(index, 1);
        }
      }
    },
    changeHostname: (state, action: PayloadAction<string>) => {
      state.hostname = action.payload;
    },
    addUser: (state) => {
      const newUser = {
        name: '',
        password: '',
        ssh_key: '',
        groups: [],
        isAdministrator: false,
        hasPassword: false,
      };

      state.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((_, index) => index !== action.payload);
    },
    setUserNameByIndex: (state, action: PayloadAction<UserPayload>) => {
      state.users[action.payload.index].name = action.payload.name;
    },
    setUserPasswordByIndex: (
      state,
      action: PayloadAction<UserPasswordPayload>,
    ) => {
      state.users[action.payload.index].password = action.payload.password;
    },
    setUserSshKeyByIndex: (state, action: PayloadAction<UserSshKeyPayload>) => {
      state.users[action.payload.index].ssh_key = action.payload.sshKey;
    },
    addPort: (state, action: PayloadAction<string>) => {
      if (!state.firewall.ports.some((port) => port === action.payload)) {
        state.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      const index = state.firewall.ports.findIndex(
        (port) => port === action.payload,
      );
      if (index !== -1) {
        state.firewall.ports.splice(index, 1);
      }
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>,
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.users[index];

      user.isAdministrator = isAdministrator;
      if (isAdministrator) {
        user.groups.push('wheel');
      } else {
        user.groups = user.groups.filter((group) => group !== 'wheel');
      }
    },
    addGroupToUserByUserIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const { index, group } = action.payload;
      if (
        !state.users[index].groups.some(
          (existingGroup) => existingGroup === group,
        )
      ) {
        state.users[index].groups.push(group);

        if (group === 'wheel') {
          state.users[index].isAdministrator = true;
        }
      }
    },
    removeGroupFromUserByIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const groupIndex = state.users[action.payload.index].groups.findIndex(
        (group) => group === action.payload.group,
      );
      if (groupIndex !== -1) {
        if (action.payload.group === 'wheel') {
          state.users[action.payload.index].isAdministrator = false;
        }
        state.users[action.payload.index].groups.splice(groupIndex, 1);
      }
    },
    addUserGroup: (state) => {
      const existingGids = new Set(
        state.userGroups.map((g) => g.gid).filter((gid) => gid !== undefined),
      );
      let nextGid = MIN_GROUP_ID;
      while (existingGids.has(nextGid) && nextGid <= MAX_GROUP_ID) {
        nextGid++;
      }

      const newGroup: UserGroup = { name: '' };
      if (nextGid <= MAX_GROUP_ID) {
        newGroup.gid = nextGid;
      }
      state.userGroups.push(newGroup);
    },
    setUserGroupNameByIndex: (
      state,
      action: PayloadAction<UserGroupNamePayload>,
    ) => {
      const { index, name } = action.payload;
      state.userGroups[index].name = name.trim();
      if (name.trim() === '') {
        delete state.userGroups[index].gid;
      } else if (state.userGroups[index].gid === undefined) {
        // Re-assign gid if the group now has a valid name but no gid
        const existingGids = new Set(
          state.userGroups.map((g) => g.gid).filter((gid) => gid !== undefined),
        );
        let nextGid = MIN_GROUP_ID;
        while (existingGids.has(nextGid) && nextGid <= MAX_GROUP_ID) {
          nextGid++;
        }
        if (nextGid <= MAX_GROUP_ID) {
          state.userGroups[index].gid = nextGid;
        }
      }
    },
    removeUserGroup: (state, action: PayloadAction<number>) => {
      state.userGroups = state.userGroups.filter(
        (_, index) => index !== action.payload,
      );
    },
    changeFips: (state, action: PayloadAction<boolean>) => {
      state.fips.enabled = action.payload;
    },
  },
});

export const {
  initializeWizard,
  changeServerUrl,
  changeBaseUrl,
  changeProxy,
  changeBlueprintMode,
  changeImageSource,
  changeArchitecture,
  changeDistribution,
  addImageType,
  removeImageType,
  changeImageTypes,
  changeAwsAccountId,
  changeAwsShareMethod,
  changeAwsSourceId,
  changeAwsRegion,
  reinitializeAws,
  changeAzureTenantId,
  changeAzureSubscriptionId,
  changeAzureResourceGroup,
  changeAzureHyperVGeneration,
  reinitializeAzure,
  changeGcpShareMethod,
  changeGcpAccountType,
  changeGcpEmail,
  reinitializeGcp,
  changeRegistrationType,
  changeActivationKey,
  changeOrgId,
  setCompliancePolicy,
  setOscapProfile,
  changeComplianceType,
  changeFileSystemConfiguration,
  changeFscMode,
  clearPartitions,
  addPartition,
  removePartition,
  removePartitionByMountpoint,
  changePartitionMountpoint,
  changePartitionUnit,
  changePartitionMinSize,
  changePartitionType,
  changePartitionName,
  changePartitionOrder,
  changeDiskMinsize,
  changeDiskType,
  addDiskPartition,
  removeDiskPartition,
  changeDiskPartitionMinsize,
  changeDiskPartitionName,
  addLogicalVolumeToVolumeGroup,
  changePartitioningMode,
  changeUseLatest,
  changeSnapshotDate,
  changeTemplate,
  changeTemplateName,
  changeCustomRepositories,
  importCustomRepositories,
  changePayloadRepositories,
  addRecommendedRepository,
  removeRecommendedRepository,
  addPackage,
  removePackage,
  addModule,
  removeModule,
  addPackageGroup,
  removePackageGroup,
  addUserGroup,
  setUserGroupNameByIndex,
  removeUserGroup,
  addLanguage,
  removeLanguage,
  clearLanguages,
  changeKeyboard,
  changeBlueprintName,
  setIsCustomName,
  changeBlueprintDescription,
  loadWizardState,
  setFirstBootScript,
  changeEnabledServices,
  addEnabledService,
  removeEnabledService,
  changeMaskedServices,
  addMaskedService,
  removeMaskedService,
  changeDisabledServices,
  addDisabledService,
  removeDisabledService,
  changeKernelName,
  addKernelArg,
  removeKernelArg,
  clearKernelAppend,
  addDisabledFirewallService,
  removeDisabledFirewallService,
  addEnabledFirewallService,
  removeEnabledFirewallService,
  changeTimezone,
  changeSatelliteRegistrationCommand,
  changeSatelliteCaCertificate,
  changeAapCallbackUrl,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
  addNtpServer,
  removeNtpServer,
  changeHostname,
  addPort,
  removePort,
  addUser,
  removeUser,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  addGroupToUserByUserIndex,
  removeGroupFromUserByIndex,
  changeRedHatRepositories,
  changeFips,
} = wizardSlice.actions;
export default wizardSlice.reducer;
