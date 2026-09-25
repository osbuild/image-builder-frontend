import z from 'zod';

import {
  groupGidInputSchema,
  groupGidSchema,
  groupInputSchema,
  groupListSchema,
  groupListWarningsSchema,
  groupWarningSchema,
  usersSliceSchema,
} from './schemas';
import type { Group, GroupInput } from './types';

import type { ValidationResult } from '../types';
import { validateList, validateSchema } from '../validators';

export const validateGroupGid = (gid?: number): ValidationResult<number> => {
  const result = validateSchema(groupGidSchema, gid);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateGroupGidInput = (
  gid?: string,
): ValidationResult<number> => {
  const result = validateSchema(groupGidInputSchema, gid);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateGroupInput = (
  group: GroupInput,
): ValidationResult<Group> => {
  const result = validateSchema(groupInputSchema, group);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateGroups = (groups?: Group[]): ValidationResult<Group[]> => {
  const result = validateList(groupListSchema, groups);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateGroupWarnings = (
  group: Group,
): ValidationResult<Group> => {
  const result = validateSchema(groupWarningSchema, group);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateGroupList = (
  groups: Group[],
): ValidationResult<Group[]> => {
  const { data, issues: errors } = validateList(groupListSchema, groups);
  const { issues: warnings } = validateList(groupListWarningsSchema, groups);

  return {
    data,
    errors,
    warnings,
  };
};

export const validateUsersSlice = (
  slice: z.infer<typeof usersSliceSchema>,
  shouldHide: boolean = false,
): ValidationResult<z.infer<typeof usersSliceSchema>> => {
  if (shouldHide) {
    return {
      errors: [],
    };
  }

  const { data, issues } = validateSchema(usersSliceSchema, slice);

  return {
    data,
    errors: issues,
  };
};
