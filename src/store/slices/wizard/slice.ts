import {
  createSelector,
  createSlice,
  PayloadAction,
  Reducer,
} from '@reduxjs/toolkit';

import type { AwsShareMethod } from '@/Components/CreateImageWizard/steps/ImageOutput/components/Aws';
import type { GcpAccountType } from '@/Components/CreateImageWizard/steps/ImageOutput/components/Gcp';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '@/Components/CreateImageWizard/steps/Packages/packagesTypes';
import type { RootState } from '@/store';
import type {
  BootcDistributionItem,
  CustomRepository,
  Distributions,
  ImageRequest,
  ImageTypes,
  Module,
  Repository,
} from '@/store/api/backend';
import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import type { ActivationKeys } from '@/store/api/rhsm';
import { yyyyMMddFormat } from '@/Utilities/time';

import { initializeWizard, loadWizardState } from './actions';
import { complianceSlice, complianceState } from './compliance';
import { detailsSlice, detailsState } from './details';
import { filesystemSlice, filesystemState } from './filesystem';
import { ImageSource, isRhel, outputState } from './output';
import {
  CombinedWizardState,
  RegistrationType,
  UserAdministratorPayload,
  UserGroupGidPayload,
  UserGroupNamePayload,
  UserGroupPayload,
  UserPasswordPayload,
  UserPayload,
  UserSshKeyPayload,
  WizardState,
} from './types';

// GID range for regular groups per LOGIN.DEFS(5) defaults
export const MIN_REGULAR_GID = 1000;
export const MAX_REGULAR_GID = 60000;

export const initialState: WizardState = {
  output: outputState,
  cloudProviders: {
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
      accountType: 'user',
      email: '',
    },
  },
  registration: {
    serverUrl: '',
    baseUrl: '',
    proxy: undefined,
    type: 'register-now-rhc',
    activationKey: undefined,
    orgId: undefined,
    satelliteRegistration: {
      command: undefined,
      caCert: undefined,
    },
    aap: {
      enabled: false,
      callbackUrl: undefined,
      hostConfigKey: undefined,
      tlsCertificateAuthority: undefined,
      skipTlsVerification: undefined,
    },
  },
  content: {
    repositories: {
      customRepositories: [],
      payloadRepositories: [],
      recommendedRepositories: [],
      redHatRepositories: [],
    },
    packages: [],
    enabledModules: [],
    groups: [],
    snapshotting: {
      useLatest: true,
      snapshotDate: '',
      template: '',
      templateName: '',
    },
    verifiedLocaleLangpacks: [],
  },
  system: {
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
    firstBoot: { script: '' },
    users: [],
    groups: [{ name: '' }],
  },
};

export const selectServerUrl = (state: RootState) => {
  return state.wizard.registration.serverUrl;
};

export const selectBaseUrl = (state: RootState) => {
  return state.wizard.registration.baseUrl;
};

export const selectProxy = (state: RootState) => {
  return state.wizard.registration.proxy;
};

export const selectAwsAccountId = (state: RootState): string => {
  return state.wizard.cloudProviders.aws.accountId;
};

export const selectAwsRegion = (state: RootState) => {
  return state.wizard.cloudProviders.aws.region;
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.cloudProviders.azure.tenantId;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.cloudProviders.azure.subscriptionId;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.cloudProviders.azure.resourceGroup;
};

export const selectAzureHyperVGeneration = (state: RootState) => {
  return state.wizard.cloudProviders.azure.hyperVGeneration;
};

export const selectGcpAccountType = (state: RootState) => {
  return state.wizard.cloudProviders.gcp.accountType;
};

export const selectGcpEmail = (state: RootState) => {
  return state.wizard.cloudProviders.gcp.email;
};

export const selectRegistrationType = (state: RootState) => {
  return state.wizard.registration.type;
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
  return state.wizard.registration.aap;
};

export const selectAapEnabled = (state: RootState) => {
  return state.wizard.registration.aap.enabled;
};

export const selectAapCallbackUrl = (state: RootState) => {
  return state.wizard.registration.aap.callbackUrl;
};

export const selectAapHostConfigKey = (state: RootState) => {
  return state.wizard.registration.aap.hostConfigKey;
};

export const selectAapTlsCertificateAuthority = (state: RootState) => {
  return state.wizard.registration.aap.tlsCertificateAuthority;
};

export const selectAapTlsConfirmation = (state: RootState) => {
  return state.wizard.registration.aap.skipTlsVerification;
};

export const selectUseLatest = (state: RootState) => {
  return state.wizard.content.snapshotting.useLatest;
};

export const selectSnapshotDate = (state: RootState) => {
  return state.wizard.content.snapshotting.snapshotDate;
};

export const selectTemplate = (state: RootState) => {
  return state.wizard.content.snapshotting.template;
};

export const selectTemplateName = (state: RootState) => {
  return state.wizard.content.snapshotting.templateName;
};

export const selectCustomRepositories = (state: RootState) => {
  return state.wizard.content.repositories.customRepositories;
};

export const selectPayloadRepositories = (state: RootState) => {
  return state.wizard.content.repositories.payloadRepositories;
};

export const selectRecommendedRepositories = (state: RootState) => {
  return state.wizard.content.repositories.recommendedRepositories;
};

export const selectRedHatRepositories = (state: RootState) => {
  return state.wizard.content.repositories.redHatRepositories;
};

export const selectPackages = (state: RootState) => {
  return state.wizard.content.packages;
};

export const selectModules = (state: RootState) => {
  return state.wizard.content.enabledModules;
};

export const selectPackageGroups = (state: RootState) => {
  return state.wizard.content.groups;
};

export const selectServices = (state: RootState) => {
  return state.wizard.system.services;
};

export const selectUsers = (state: RootState) => {
  return state.wizard.system.users;
};

export const selectNonEmptyUsers = createSelector([selectUsers], (users) =>
  users.filter(
    (user) =>
      user.name.trim() ||
      user.password.trim() ||
      user.ssh_key.trim() ||
      user.hasPassword,
  ),
);

export const selectUserGroups = (state: RootState) => {
  return state.wizard.system.groups;
};

export const selectNonEmptyUserGroups = createSelector(
  [selectUserGroups],
  (groups) => groups.filter((group) => group.name.trim() || group.gid),
);

export const selectKernel = (state: RootState) => {
  return state.wizard.system.kernel;
};

export const selectLanguages = (state: RootState) => {
  return state.wizard.system.locale.languages;
};

export const selectKeyboard = (state: RootState) => {
  return state.wizard.system.locale.keyboard;
};

export const selectFirstBootScript = (state: RootState) => {
  return state.wizard.system.firstBoot.script;
};

export const selectTimezone = (state: RootState) => {
  return state.wizard.system.timezone.timezone;
};

export const selectNtpServers = (state: RootState) => {
  return state.wizard.system.timezone.ntpservers;
};

export const selectHostname = (state: RootState) => {
  return state.wizard.system.hostname;
};

export const selectFirewall = (state: RootState) => {
  return state.wizard.system.firewall;
};

export const selectVerifiedLocaleLangpacks = (state: RootState) => {
  return state.wizard.content.verifiedLocaleLangpacks;
};

const extractLanguageCode = (locale: string): string | undefined => {
  const [regionPart] = locale.split('.');
  const [languageCode] = regionPart.split('_');
  if (!languageCode) {
    return undefined;
  }
  const lc = languageCode.toLowerCase();
  if (lc === 'c') {
    return undefined;
  }
  return lc;
};

const getLangpackNameForLocale = (locale: string): string | undefined => {
  const code = extractLanguageCode(locale);
  return code ? `langpacks-${code}` : undefined;
};

export const selectLocaleLangpackCandidates = createSelector(
  [selectLanguages],
  (languages) => {
    const set = new Set<string>();
    for (const lang of languages ?? []) {
      const pkg = getLangpackNameForLocale(lang);
      if (pkg) {
        set.add(pkg);
      }
    }
    return Array.from(set);
  },
);

export const selectFirewallEnabled = createSelector(
  [selectFirewall],
  (firewall) => {
    if (firewall.ports.length > 0) return true;
    if (firewall.services.enabled.length > 0) return true;
    if (firewall.services.disabled.length > 0) return true;
    return false;
  },
);

export const selectAapTlsConfigured = createSelector(
  [selectAapTlsCertificateAuthority],
  (certificate) => {
    return certificate && certificate !== '';
  },
);

// Derived selector for getting all repositories
export const selectAllRepositoryIds = createSelector(
  [
    selectCustomRepositories,
    selectPayloadRepositories,
    selectRecommendedRepositories,
  ],
  (custom, payload, recommended) =>
    Array.from(
      new Set([
        ...custom.map(({ id }) => id).flat(1),
        ...payload.map(({ id }) => id),
        ...recommended.map(({ uuid }) => uuid),
      ]),
    ),
);

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    changeServerUrl: (state, action: PayloadAction<string>) => {
      state.registration.serverUrl = action.payload;
    },
    changeBaseUrl: (state, action: PayloadAction<string>) => {
      state.registration.baseUrl = action.payload;
    },
    changeProxy: (state, action: PayloadAction<string | undefined>) => {
      state.registration.proxy = action.payload;
    },
    changeImageSource: (
      state,
      action: PayloadAction<ImageSource | undefined>,
    ) => {
      state.output.imageSource = action.payload;
    },
    changeIsoPayloadReference: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.output.isoPayloadReference = action.payload;
    },
    changeBootcDistributions: (
      state,
      action: PayloadAction<BootcDistributionItem[]>,
    ) => {
      state.output.bootcDistributions = action.payload;
    },
    changeArchitecture: (
      state,
      action: PayloadAction<ImageRequest['architecture']>,
    ) => {
      state.output.architecture = action.payload;
    },
    changeDistribution: (state, action: PayloadAction<Distributions>) => {
      state.output.distribution = action.payload;

      if (process.env.IS_ON_PREMISE && !isRhel(action.payload)) {
        state.registration.type = 'register-later';
      }
    },
    addImageType: (state, action: PayloadAction<ImageTypes>) => {
      // Remove (if present) before adding to avoid duplicates
      state.output.imageTypes = state.output.imageTypes.filter(
        (imageType) => imageType !== action.payload,
      );
      state.output.imageTypes.push(action.payload);
    },
    removeImageType: (state, action: PayloadAction<ImageTypes>) => {
      state.output.imageTypes = state.output.imageTypes.filter(
        (imageType) => imageType !== action.payload,
      );
    },
    changeImageTypes: (state, action: PayloadAction<ImageTypes[]>) => {
      state.output.imageTypes = action.payload;
      // isoPayloadReference is only relevant for bootable-container-iso,
      // clear it when that image type is no longer selected
      if (!action.payload.includes('bootable-container-iso')) {
        state.output.isoPayloadReference = undefined;
      }
    },
    changeAwsAccountId: (state, action: PayloadAction<string>) => {
      state.cloudProviders.aws.accountId = action.payload;
    },
    changeAwsShareMethod: (state, action: PayloadAction<AwsShareMethod>) => {
      state.cloudProviders.aws.shareMethod = action.payload;
    },
    changeAwsSourceId: (state, action: PayloadAction<string | undefined>) => {
      state.cloudProviders.aws.sourceId = action.payload;
    },
    changeAwsRegion: (state, action: PayloadAction<string | undefined>) => {
      state.cloudProviders.aws.region = action.payload;
    },
    reinitializeAws: (state) => {
      state.cloudProviders.aws.accountId = '';
      state.cloudProviders.aws.shareMethod = 'manual';
      state.cloudProviders.aws.source = undefined;
      state.cloudProviders.aws.region = 'us-east-1';
    },
    changeAzureTenantId: (state, action: PayloadAction<string>) => {
      state.cloudProviders.azure.tenantId = action.payload;
    },
    changeAzureSubscriptionId: (state, action: PayloadAction<string>) => {
      state.cloudProviders.azure.subscriptionId = action.payload;
    },
    changeAzureResourceGroup: (state, action: PayloadAction<string>) => {
      state.cloudProviders.azure.resourceGroup = action.payload;
    },
    changeAzureHyperVGeneration: (
      state,
      action: PayloadAction<'V1' | 'V2'>,
    ) => {
      state.cloudProviders.azure.hyperVGeneration = action.payload;
    },
    reinitializeAzure: (state) => {
      state.cloudProviders.azure.tenantId = undefined;
      state.cloudProviders.azure.subscriptionId = undefined;
      state.cloudProviders.azure.resourceGroup = undefined;
    },
    changeGcpAccountType: (state, action: PayloadAction<GcpAccountType>) => {
      state.cloudProviders.gcp.accountType = action.payload;
    },
    changeGcpEmail: (state, action: PayloadAction<string>) => {
      state.cloudProviders.gcp.email = action.payload;
    },
    reinitializeGcp: (state) => {
      state.cloudProviders.gcp.accountType = 'user';
      state.cloudProviders.gcp.email = '';
    },
    changeRegistrationType: (
      state,
      action: PayloadAction<RegistrationType>,
    ) => {
      state.registration.type = action.payload;
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
    changeAapEnabled: (state, action: PayloadAction<boolean>) => {
      state.registration.aap.enabled = action.payload;
    },
    changeAapCallbackUrl: (state, action: PayloadAction<string>) => {
      state.registration.aap.callbackUrl = action.payload;
    },

    changeAapHostConfigKey: (state, action: PayloadAction<string>) => {
      state.registration.aap.hostConfigKey = action.payload;
    },
    changeAapTlsCertificateAuthority: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.registration.aap.tlsCertificateAuthority = action.payload;
    },
    changeAapTlsConfirmation: (state, action: PayloadAction<boolean>) => {
      state.registration.aap.skipTlsVerification = action.payload;
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
    changeUseLatest: (state, action: PayloadAction<boolean>) => {
      if (!action.payload && state.content.snapshotting.snapshotDate === '') {
        state.content.snapshotting.snapshotDate = `${yyyyMMddFormat(new Date())}T00:00:00.000Z`;
      }

      state.content.snapshotting.useLatest = action.payload;
    },
    changeSnapshotDate: (state, action: PayloadAction<string>) => {
      // Store DatePicker's YYYY-MM-DD format as RFC3339 e.g. "2025-11-26T00:00:00.000Z" in state
      const yyyyMMDDRegex = /^\d{4}-\d{2}-\d{2}$/;
      const date = new Date(action.payload);
      if (yyyyMMDDRegex.test(action.payload) && !isNaN(date.getTime())) {
        state.content.snapshotting.snapshotDate = date.toISOString();
      } else {
        // For empty strings or already-ISO formatted strings, store as-is
        state.content.snapshotting.snapshotDate = action.payload;
      }
    },
    changeTemplate: (state, action: PayloadAction<string>) => {
      state.content.snapshotting.template = action.payload;
    },
    changeTemplateName: (state, action: PayloadAction<string>) => {
      state.content.snapshotting.templateName = action.payload;
    },
    importCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.content.repositories.customRepositories = [
        ...state.content.repositories.customRepositories,
        ...action.payload,
      ];
    },
    changeCustomRepositories: (
      state,
      action: PayloadAction<CustomRepository[]>,
    ) => {
      state.content.repositories.customRepositories = action.payload;
    },
    changePayloadRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.content.repositories.payloadRepositories = action.payload;
    },
    changeRedHatRepositories: (state, action: PayloadAction<Repository[]>) => {
      state.content.repositories.redHatRepositories = action.payload;
    },
    addRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      if (
        !state.content.repositories.recommendedRepositories.some(
          (repo) => repo.url === action.payload.url,
        )
      ) {
        state.content.repositories.recommendedRepositories.push(action.payload);
      }
    },
    removeRecommendedRepository: (
      state,
      action: PayloadAction<ApiRepositoryResponseRead>,
    ) => {
      state.content.repositories.recommendedRepositories =
        state.content.repositories.recommendedRepositories.filter(
          (repo) => repo.url !== action.payload.url,
        );
    },
    addPackage: (state, action: PayloadAction<IBPackageWithRepositoryInfo>) => {
      const existingPackageIndex = state.content.packages.findIndex(
        (pkg) => pkg.name === action.payload.name,
      );

      if (existingPackageIndex !== -1) {
        state.content.packages[existingPackageIndex] = action.payload;
      } else {
        state.content.packages.push(action.payload);
      }
    },
    removePackage: (
      state,
      action: PayloadAction<IBPackageWithRepositoryInfo['name']>,
    ) => {
      const index = state.content.packages.findIndex(
        (pkg) => pkg.name === action.payload,
      );
      if (index !== -1) {
        state.content.packages.splice(index, 1);
      }
    },
    addModule: (state, action: PayloadAction<Module>) => {
      const existingModuleIndex = state.content.enabledModules.findIndex(
        (module) => module.name === action.payload.name,
      );

      if (existingModuleIndex !== -1) {
        state.content.enabledModules[existingModuleIndex] = action.payload;
      } else {
        state.content.enabledModules.push(action.payload);
      }
    },
    removeModule: (state, action: PayloadAction<Module['name']>) => {
      const index = state.content.enabledModules.findIndex(
        (module) => module.name === action.payload,
      );
      // count other packages from the same module
      const pkgCount = state.content.packages.filter(
        (pkg) => pkg.module_name === action.payload,
      );
      // if the module exists and it's not connected to any packages, remove it
      if (index !== -1 && pkgCount.length < 1) {
        state.content.enabledModules.splice(index, 1);
      }
    },
    addPackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo>,
    ) => {
      const existingGrpIndex = state.content.groups.findIndex(
        (grp) => grp.name === action.payload.name,
      );

      if (existingGrpIndex !== -1) {
        state.content.groups[existingGrpIndex] = action.payload;
      } else {
        state.content.groups.push(action.payload);
      }
    },
    removePackageGroup: (
      state,
      action: PayloadAction<GroupWithRepositoryInfo['name']>,
    ) => {
      const index = state.content.groups.findIndex(
        (grp) => grp.name === action.payload,
      );
      if (index !== -1) {
        state.content.groups.splice(index, 1);
      }
    },
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.system.locale.languages &&
        !state.system.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.system.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.system.locale.languages) {
        const index = state.system.locale.languages.findIndex(
          (lang) => lang === action.payload,
        );
        if (index !== -1) {
          state.system.locale.languages.splice(index, 1);
        }
      }
    },
    replaceLanguage: (
      state,
      action: PayloadAction<{ oldLanguage: string; newLanguage: string }>,
    ) => {
      if (state.system.locale.languages) {
        const index = state.system.locale.languages.findIndex(
          (lang) => lang === action.payload.oldLanguage,
        );
        if (index !== -1) {
          state.system.locale.languages[index] = action.payload.newLanguage;
        }
      }
    },
    clearLanguages: (state) => {
      state.system.locale.languages = [];
    },
    clearLocale: (state) => {
      state.system.locale.languages = [];
      state.system.locale.keyboard = '';
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.system.locale.keyboard = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      state.system.firstBoot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.enabled.splice(index, 1);
      }
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.masked.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.masked.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.masked.splice(index, 1);
      }
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.disabled.splice(index, 1);
      }
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.system.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.system.kernel.append.findIndex(
        (arg) => arg === action.payload,
      );

      if (existingArgIndex !== -1) {
        state.system.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.system.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.system.kernel.append.length > 0) {
        const index = state.system.kernel.append.findIndex(
          (arg) => arg === action.payload,
        );
        if (index !== -1) {
          state.system.kernel.append.splice(index, 1);
        }
      }
    },
    clearKernelAppend: (state) => {
      state.system.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.services.enabled.splice(index, 1);
      }
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.services.disabled.splice(index, 1);
      }
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.system.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.system.timezone.ntpservers?.some(
          (server) => server === action.payload,
        )
      ) {
        state.system.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      if (state.system.timezone.ntpservers) {
        const index = state.system.timezone.ntpservers.findIndex(
          (server) => server === action.payload,
        );
        if (index !== -1) {
          state.system.timezone.ntpservers.splice(index, 1);
        }
      }
    },
    clearTimezone: (state) => {
      state.system.timezone.timezone = '';
      state.system.timezone.ntpservers = [];
    },
    changeHostname: (state, action: PayloadAction<string>) => {
      state.system.hostname = action.payload;
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

      state.system.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.system.users = state.system.users.filter(
        (_, index) => index !== action.payload,
      );
    },
    setUserNameByIndex: (state, action: PayloadAction<UserPayload>) => {
      state.system.users[action.payload.index].name = action.payload.name;
    },
    setUserPasswordByIndex: (
      state,
      action: PayloadAction<UserPasswordPayload>,
    ) => {
      state.system.users[action.payload.index].password =
        action.payload.password;
    },
    setUserSshKeyByIndex: (state, action: PayloadAction<UserSshKeyPayload>) => {
      state.system.users[action.payload.index].ssh_key = action.payload.sshKey;
    },
    addPort: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.ports.some((port) => port === action.payload)
      ) {
        state.system.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.ports.findIndex(
        (port) => port === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.ports.splice(index, 1);
      }
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>,
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.system.users[index];

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
        !state.system.users[index].groups.some(
          (existingGroup) => existingGroup === group,
        )
      ) {
        state.system.users[index].groups.push(group);

        if (group === 'wheel') {
          state.system.users[index].isAdministrator = true;
        }
      }
    },
    removeGroupFromUserByIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const groupIndex = state.system.users[
        action.payload.index
      ].groups.findIndex((group) => group === action.payload.group);
      if (groupIndex !== -1) {
        if (action.payload.group === 'wheel') {
          state.system.users[action.payload.index].isAdministrator = false;
        }
        state.system.users[action.payload.index].groups.splice(groupIndex, 1);
      }
    },
    addUserGroup: (state) => {
      const existingGids = new Set(
        state.system.groups
          .map((g) => g.gid)
          .filter((gid): gid is number => gid !== undefined),
      );
      let nextGid = MIN_REGULAR_GID;
      while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
        nextGid++;
      }
      if (nextGid <= MAX_REGULAR_GID) {
        state.system.groups.push({ name: '', gid: nextGid });
      } else {
        state.system.groups.push({ name: '' });
      }
    },
    setUserGroupNameByIndex: (
      state,
      action: PayloadAction<UserGroupNamePayload>,
    ) => {
      const { index, name } = action.payload;
      state.system.groups[index].name = name.trim();
      if (name.trim() === '') {
        delete state.system.groups[index].gid;
      } else if (state.system.groups[index].gid === undefined) {
        const existingGids = new Set(
          state.system.groups
            .map((g) => g.gid)
            .filter((gid): gid is number => gid !== undefined),
        );
        let nextGid = MIN_REGULAR_GID;
        while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
          nextGid++;
        }
        if (nextGid <= MAX_REGULAR_GID) {
          state.system.groups[index].gid = nextGid;
        }
      }
    },
    setUserGroupGidByIndex: (
      state,
      action: PayloadAction<UserGroupGidPayload>,
    ) => {
      const { index, gid } = action.payload;
      if (gid === undefined) {
        delete state.system.groups[index].gid;
      } else {
        state.system.groups[index].gid = gid;
      }
    },
    removeUserGroup: (state, action: PayloadAction<number>) => {
      state.system.groups = state.system.groups.filter(
        (_, index) => index !== action.payload,
      );
    },
    setVerifiedLocaleLangpacks: (state, action: PayloadAction<string[]>) => {
      state.content.verifiedLocaleLangpacks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        (_, action: PayloadAction<WizardState>) => action.payload,
      );
  },
});

export const {
  changeServerUrl,
  changeBaseUrl,
  changeProxy,
  changeImageSource,
  changeIsoPayloadReference,
  changeBootcDistributions,
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
  changeGcpAccountType,
  changeGcpEmail,
  reinitializeGcp,
  changeRegistrationType,
  changeActivationKey,
  changeOrgId,
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
  setUserGroupGidByIndex,
  removeUserGroup,
  addLanguage,
  removeLanguage,
  replaceLanguage,
  clearLanguages,
  clearLocale,
  changeKeyboard,
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
  changeAapEnabled,
  changeAapCallbackUrl,
  changeAapHostConfigKey,
  changeAapTlsCertificateAuthority,
  changeAapTlsConfirmation,
  addNtpServer,
  removeNtpServer,
  clearTimezone,
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
  setVerifiedLocaleLangpacks,
} = wizardSlice.actions;

// we can't use RTK query's `combineSlices` helper yet, we
// first need to convert all the items into submodules and
// then we can compose the slice using the `combineSlices`.
// The reason for this is that there is no way to nest the
// child slice under the parent slice yet, we would need
// to temporarily change the slice shape, which is not ideal
export const combinedInitialState: CombinedWizardState = {
  ...initialState,
  compliance: complianceState,
  details: detailsState,
  filesystem: filesystemState,
};

export const wizardReducer: Reducer<CombinedWizardState> = (state, action) => {
  const coreState = wizardSlice.reducer(
    state as WizardState | undefined,
    action,
  );
  return {
    ...coreState,
    compliance: complianceSlice.reducer(state?.compliance, action),
    details: detailsSlice.reducer(state?.details, action),
    filesystem: filesystemSlice.reducer(state?.filesystem, action),
  };
};
