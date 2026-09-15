import { Customizations } from '@/store/api/backend';

import { initialState } from './state';
import { UsersSlice } from './types';

import { RequestLike } from '../types';

const parseUsers = ({ users }: Customizations): UsersSlice['users'] => {
  if (!users || users.length === 0) {
    return initialState.users;
  }

  return users.map((user) => ({
    name: user.name,
    password: '', // The image-builder API does not return the password.
    ssh_key: user.ssh_key || '',
    groups: user.groups || [],
    isAdministrator: user.groups?.includes('wheel') || false,
    hasPassword: user.hasPassword || false,
  }));
};

const parseGroups = ({ groups }: Customizations): UsersSlice['groups'] => {
  if (!groups || groups.length === 0) {
    return initialState.groups;
  }

  return groups.map((group) => ({
    name: group.name,
    ...(group.gid && { gid: group.gid }),
  }));
};

export const parseUsersFromRequest = ({
  customizations,
}: RequestLike): UsersSlice => ({
  users: parseUsers(customizations),
  groups: parseGroups(customizations),
});
