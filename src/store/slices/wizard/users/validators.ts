import {
  groupGidInputSchema,
  groupGidSchema,
  groupInputSchema,
  groupListSchema,
  groupListWarningsSchema,
  groupWarningSchema,
  userListSchema,
  usersSliceSchema,
} from './schemas';
import type { Group, GroupInput, User, UsersSlice } from './types';

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

export const validateUserList = (users: User[]): ValidationResult<User[]> => {
  const { data, issues: errors } = validateList(userListSchema, users);

  return {
    data,
    errors,
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
