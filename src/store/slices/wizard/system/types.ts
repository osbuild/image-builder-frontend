import z from 'zod';

import { Locale, Timezone, User } from '@/store/api/backend';

import {
  firewallSchema,
  kernelSchema,
  servicesSchema,
  systemSchema,
} from './schemas';

export type Kernel = z.infer<typeof kernelSchema>;
export type Services = z.infer<typeof servicesSchema>;
export type Firewall = z.infer<typeof firewallSchema>;

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

export type SystemSlice = z.infer<typeof systemSchema> & {
  locale: Locale;
  timezone: Timezone;
  firstBoot: {
    script: string;
  };
  users: UserWithAdditionalInfo[];
  groups: UserGroup[];
};
