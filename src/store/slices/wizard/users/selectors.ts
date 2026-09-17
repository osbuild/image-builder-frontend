import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectUsers = (state: RootState) => {
  return state.wizard.users.users;
};

export const selectNonEmptyUsers = createSelector([selectUsers], (users) =>
  users.filter(
    (user) =>
      user.name.trim() ||
      user.password.trim() ||
      user.ssh_key.trim() ||
      user.hasPassword,
  ),
);

export const selectUserGroups = (state: RootState) => {
  return state.wizard.users.groups;
};

export const selectNonEmptyUserGroups = createSelector(
  [selectUserGroups],
  (groups) => groups.filter((group) => group.name.trim() || group.gid),
);

export const selectHasUsers = createSelector(
  [selectNonEmptyUsers],
  (users) => users.length > 0,
);

export const selectHasUserGroups = createSelector(
  [selectNonEmptyUserGroups],
  (groups) => groups.length > 0,
);
