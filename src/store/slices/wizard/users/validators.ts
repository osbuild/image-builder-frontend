import {
  groupGidInputSchema,
  groupInputSchema,
  groupListSchema,
  groupListWarningsSchema,
  usersSliceSchema,
} from './schemas';
import type { Group, GroupInput, UsersSlice } from './types';

import type { ValidationResult } from '../types';
import { validateList, validateSchema } from '../validators';

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
  slice: UsersSlice,
  shouldHide: boolean = false,
): ValidationResult<UsersSlice> => {
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
