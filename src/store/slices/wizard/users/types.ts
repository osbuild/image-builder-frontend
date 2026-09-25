import z from 'zod';

import { User } from '@/store/api/backend';

import { groupInputSchema, groupSchema } from './schemas';

export type Group = z.infer<typeof groupSchema>;
export type GroupInput = z.input<typeof groupInputSchema>;

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

export type UsersSlice = {
  users: UserWithAdditionalInfo[];
  groups: Group[];
};
