import { createSelector } from '@reduxjs/toolkit';

import type { Group, User } from '@/store/api/backend';

import { selectUserGroups, selectUsers } from './selectors';
import { UserWithAdditionalInfo } from './types';

const mapUsers = createSelector([selectUsers], (users) => {
  if (users.length === 0) {
    return undefined;
  }

  const customizationUsers = users
    .filter(
      (user: UserWithAdditionalInfo) =>
        user.name || user.password || user.ssh_key || user.groups.length > 0,
    )
    .map((user: UserWithAdditionalInfo) => {
      const result: User = {
        name: user.name,
      };
      if (user.password !== '') {
        result.password = user.password;
      }
      if (user.ssh_key !== '') {
        result.ssh_key = user.ssh_key;
      }
      if (user.groups.length > 0) {
        result.groups = user.groups;
      }
      result.hasPassword = user.hasPassword || user.password !== '';
      return result as User;
    });

  if (customizationUsers.length === 0) {
    return undefined;
  }

  return {
    users: customizationUsers,
  };
});

const mapGroups = createSelector([selectUserGroups], (groups) => {
  if (groups.length === 0) {
    return undefined;
  }

  const customizationGroups = groups
    .filter((group) => group.name && group.name.trim() !== '')
    .map((group) => {
      const result: Group = {
        name: group.name,
      };
      if (group.gid !== undefined) {
        result.gid = group.gid;
      }
      return result;
    });

  if (customizationGroups.length === 0) {
    return undefined;
  }

  return {
    groups: customizationGroups,
  };
});

export const mapUsersCustomizations = createSelector(
  [mapUsers, mapGroups],
  (users, groups) => ({
    ...users,
    ...groups,
  }),
);
