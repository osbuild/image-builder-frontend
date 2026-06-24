import { Locale, Timezone, User } from '@/store/api/backend';

import { CloudProviderSlice } from './cloud';
import { ComplianceSlice } from './compliance';
import { ContentSlice } from './content';
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
  content: ContentSlice;
  details: DetailsSlice;
  filesystem: FilesystemSlice;
  output: OutputSlice;
  registration: RegistrationSlice;
};
