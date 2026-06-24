import {
  GroupWithRepositoryInfo,
  IBPackageWithRepositoryInfo,
} from '@/Components/CreateImageWizard/steps/Packages/packagesTypes';
import {
  CustomRepository,
  Locale,
  Module,
  Repository,
  Timezone,
  User,
} from '@/store/api/backend';
import { ApiRepositoryResponseRead } from '@/store/api/contentSources';

import { CloudProviderSlice } from './cloud';
import { ComplianceSlice } from './compliance';
import { DetailsSlice } from './details';
import { FilesystemSlice } from './filesystem';
import { OutputSlice } from './output';
import { RegistrationSlice } from './registration';

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
  registration: RegistrationSlice;
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
  cloudProviders: CloudProviderSlice;
  compliance: ComplianceSlice;
  details: DetailsSlice;
  filesystem: FilesystemSlice;
  output: OutputSlice;
};
