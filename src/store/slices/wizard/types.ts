import { AwsShareMethod } from '@/Components/CreateImageWizard/steps/ImageOutput/components/Aws';
import { GcpAccountType } from '@/Components/CreateImageWizard/steps/ImageOutput/components/Gcp';
import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '@/Components/CreateImageWizard/steps/Packages/packagesTypes';
import { V1ListSourceResponseItem } from '@/Components/CreateImageWizard/types';
import {
  BootcDistributionItem,
  CustomRepository,
  Distributions,
  ImageRequest,
  ImageTypes,
  Locale,
  Module,
  Repository,
  Timezone,
  User,
} from '@/store/api/backend';
import { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import { ActivationKeys } from '@/store/api/rhsm';

import { ComplianceSlice } from './compliance';
import { DetailsSlice } from './details';
import { FilesystemSlice } from './filesystem';

export type ImageSource = string;

export type RegistrationType =
  | 'register-later'
  | 'register-now'
  | 'register-now-insights'
  | 'register-now-rhc'
  | 'register-satellite'
  | 'register-aap';

export type UserWithAdditionalInfo = {
  [K in keyof User]-?: NonNullable<User[K]>;
} & {
  isAdministrator: boolean;
};

export type UserPayload = {
  index: number;
  name: string;
};

export type UserPasswordPayload = {
  index: number;
  password: string;
};

export type UserSshKeyPayload = {
  index: number;
  sshKey: string;
};

export type UserAdministratorPayload = {
  index: number;
  isAdministrator: boolean;
};

export type UserGroupPayload = {
  index: number;
  group: string;
};

export type UserGroupNamePayload = {
  index: number;
  name: string;
};

export type UserGroupGidPayload = {
  index: number;
  gid: number | undefined;
};

export type UserGroup = {
  name: string;
  gid?: number;
};

export type WizardState = {
  output: {
    imageSource?: ImageSource | undefined;
    isoPayloadReference?: string | undefined;
    bootcDistributions: BootcDistributionItem[];
    architecture: ImageRequest['architecture'];
    distribution: Distributions;
    imageTypes: ImageTypes[];
  };
  cloudProviders: {
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
      accountType: GcpAccountType;
      email: string;
    };
  };
  registration: {
    serverUrl: string;
    baseUrl: string;
    proxy: string | undefined;
    type: RegistrationType;
    activationKey: ActivationKeys['name'];
    orgId: string | undefined;
    satelliteRegistration: {
      command: string | undefined;
      caCert: string | undefined;
    };
    aap: {
      enabled: boolean;
      callbackUrl: string | undefined;
      hostConfigKey: string | undefined;
      tlsCertificateAuthority: string | undefined;
      skipTlsVerification: boolean | undefined;
    };
  };
  compliance: ComplianceSlice;
  content: {
    repositories: {
      customRepositories: CustomRepository[];
      payloadRepositories: Repository[];
      recommendedRepositories: ApiRepositoryResponseRead[];
      redHatRepositories: Repository[];
    };
    packages: IBPackageWithRepositoryInfo[];
    enabledModules: Module[];
    groups: GroupWithRepositoryInfo[];
    snapshotting: {
      useLatest: boolean;
      snapshotDate: string;
      template: string;
      templateName: string;
    };
    verifiedLocaleLangpacks: string[];
  };
  system: {
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
    timezone: Timezone;
    hostname: string;
    firewall: {
      ports: string[];
      services: {
        enabled: string[];
        disabled: string[];
      };
    };
    firstBoot: {
      script: string;
    };
    users: UserWithAdditionalInfo[];
    groups: UserGroup[];
  };
};

export type CombinedWizardState = WizardState & {
  details: DetailsSlice;
  filesystem: FilesystemSlice;
};
