import z from 'zod';

import {
  groupInputSchema,
  groupSchema,
  userSchema,
  usersSliceSchema,
} from './schemas';

export type Group = z.infer<typeof groupSchema>;
export type GroupInput = z.input<typeof groupInputSchema>;
export type User = z.infer<typeof userSchema>;
export type UsersSlice = z.infer<typeof usersSliceSchema>;

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

export type UserGroupPayload = {
  index: number;
  group: string;
};
