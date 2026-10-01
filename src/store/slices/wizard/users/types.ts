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
