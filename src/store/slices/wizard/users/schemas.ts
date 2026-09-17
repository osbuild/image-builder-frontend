import z from 'zod';

import { MAX_REGULAR_GID, MIN_REGULAR_GID } from './constants';

import { uniqueBy } from '../utilities';

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

export const usersSliceSchema = z.object({
  groups: groupListSchema,
});
