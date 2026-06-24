import { Locale, Timezone, User } from '@/store/api/backend';

export type UserWithAdditionalInfo = {
  [K in keyof User]-?: NonNullable<User[K]>;
} & {
  isAdministrator: boolean;
  hasPassword: boolean;
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

export type SystemSlice = {
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
