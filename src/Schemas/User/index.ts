import { z } from 'zod/v4';

import { UsernameSchema } from './Username';
import { GroupsSchema } from './Groups';
import { SSHKeySchema } from './SSHKey';
import { PasswordSchema } from './Password';

// export both collection and single object
// schema since we may need to validate both
// a single user and a list of users
export const UserSchema = z.object({
  name: UsernameSchema,
  groups: GroupsSchema,
  ssh_key: SSHKeySchema,
  password: PasswordSchema,
  hasPassword: z.boolean().optional(),
  isAdministrator: z.boolean().default(false),
});

// TODO: check for duplicate usernames
export const UsersSchema = z.array(UserSchema);

export type User = z.infer<typeof UserSchema>;
export type Users = z.infer<typeof UsersSchema>;
