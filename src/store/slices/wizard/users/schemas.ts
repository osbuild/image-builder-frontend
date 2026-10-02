import z from 'zod';

import { MAX_REGULAR_GID, MIN_REGULAR_GID, SYSTEM_GROUPS } from './constants';

import { uniqueArray, uniqueBy } from '../utilities';

// see `man groupadd` for the exact specification
export const groupNameSchema = z
  .string()
  .trim()
  .min(1, 'Group name is required')
  .max(32, 'Group name must be 32 characters or fewer')
  .regex(
    /^[a-zA-Z0-9_]/,
    'Group name must start with a letter, digit, or underscore',
  )
  .regex(/^[a-zA-Z0-9_-]*\$?$/, 'Group name contains invalid characters')
  .regex(/[a-zA-Z]+/, 'Group name must contain at least one letter');

export const groupGidSchema = z.number().int().nonnegative();

export const groupGidInputSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d+$/.test(value),
    'Group ID must contain only digits',
  )
  .transform((value) => (value === '' ? undefined : Number(value)))
  .pipe(groupGidSchema.optional());

export const groupInputSchema = z.object({
  name: groupNameSchema,
  gid: groupGidInputSchema.optional(),
});

export const groupSchema = z.object({
  name: groupNameSchema,
  gid: groupGidSchema.optional(),
});

export const groupListSchema = z
  .array(groupSchema)
  .superRefine(uniqueBy('group names', 'name', (group) => group.name))
  .superRefine(uniqueBy('group ids', 'gid', (group) => group.gid));

export const groupWarningSchema = z.object({
  name: z.string(),
  gid: groupGidSchema
    .min(MIN_REGULAR_GID, `Standard GID should be above ${MIN_REGULAR_GID}`)
    .max(MAX_REGULAR_GID, `Standard GID should be below ${MAX_REGULAR_GID}`)
    .optional(),
});

export const groupListWarningsSchema = z.array(groupWarningSchema);

export const userNameSchema = z
  .string()
  .max(32, 'User name must be 32 characters or fewer')
  .regex(/^(?!\d+$)/, 'User name cannot only contain numbers')
  .regex(
    // TODO: we could probably break this down even further
    // and make the errors more atomic
    /^[a-zA-Z0-9][a-zA-Z0-9_.-]*[a-zA-Z0-9_$]$/,
    'Invalid user name format',
  );

const encryptedPasswordSchema = z
  .string()
  .regex(/^\$[^$]+\$/, 'Invalid encrypted passsword');

// NOTE: password is a special case since we could have an encrypted password
// so we have to define the schema slightly differently to how we would normally
// i.e. setting z.string().min().max() is not enough in this case
export const passwordSchema = z.string().superRefine((password, ctx) => {
  if (password === '' || encryptedPasswordSchema.safeParse(password).success) {
    return;
  }

  if (password.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      message: 'Password cannot contain only whitespace',
    });
    return;
  }

  if (password.length < 6) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password must contain at least 6 characters',
    });
    return;
  }

  if (password.length > 128) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password must be 128 characters or fewer',
    });
  }
});

export const sshKeySchema = z.union([
  z.literal(''),
  z
    .string()
    .regex(
      // Key types: ssh-rsa, ssh-dss, ssh-ed25519, or ecdsa-sha2-nistp(256|384|521).
      /^(ssh-rsa|ssh-dss|ssh-ed25519|ecdsa-sha2-nistp(?:256|384|521))\s/,
      'Unsupported SSH key type',
    )
    .regex(
      // Base64-encoded key material.
      // Optional comment at the end.
      /^\S+\s+[A-Za-z0-9+/]+={0,2}(?:\s+.*)?$/,
      'Invalid SSH key format',
    ),
]);

export const userGroupListSchema = z
  .array(groupNameSchema)
  .superRefine(uniqueArray('user groups'));

export const userSchema = z
  .object({
    name: userNameSchema,
    password: passwordSchema.optional(),
    ssh_key: sshKeySchema.optional(),
    groups: userGroupListSchema,
    hasPassword: z.boolean(),
  })
  .superRefine((user, ctx) => {
    if (user.groups.includes(user.name)) {
      ctx.addIssue({
        code: 'custom',
        path: ['groups'],
        message: 'User cannot be a member of a group with the same name',
      });
    }
  });

export const userListSchema = z
  .array(userSchema)
  .superRefine(uniqueBy('user names', 'name', (user) => user.name));

export const userWarningSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
  sshKey: z.string().optional(),
  hasPassword: z.boolean(),
  groups: z.array(z.string()),
});

// This is a cross-slice schema so we can validate
// user groups on the user field level against the
// list of known groups in the store + `wheel`
export const usersSliceWarningSchema = z
  .object({
    users: z.array(userWarningSchema),
    groups: groupListWarningsSchema,
  })
  .superRefine((slice, ctx) => {
    const knownGroups = [
      ...SYSTEM_GROUPS,
      ...slice.groups.map((group) => group.name),
    ];

    for (const [index, user] of slice.users.entries()) {
      const unknownGroups = user.groups.filter(
        (group) => !knownGroups.includes(group),
      );

      if (unknownGroups.length > 0) {
        ctx.addIssue({
          code: 'custom',
          // NOTE: we are just returning the user index here to make
          // essentially, this is a user validation but we are checking
          // the user group lists against the list of known groups
          path: [index, 'groups'],
          message: `User assigned to undefined group(s): ${unknownGroups.join(', ')}. Ensure these groups exist on the system through a package or define them in the 'Groups' section above.`,
        });
      }
    }
  });

export const usersSliceSchema = z.object({
  users: userListSchema,
  groups: groupListSchema,
});
