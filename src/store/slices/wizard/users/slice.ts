import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';
import {
  Group,
  UserAdministratorPayload,
  UserGroupPayload,
  UserPasswordPayload,
  UserPayload,
  UserSshKeyPayload,
} from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const usersSlice = createSlice({
  name: 'wizard/users',
  initialState,
  reducers: {
    addUser: (state) => {
      const newUser = {
        name: '',
        password: '',
        ssh_key: '',
        groups: [],
        isAdministrator: false,
        hasPassword: false,
      };

      state.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((_, index) => index !== action.payload);
    },
    clearUsersAndGroups: (state) => {
      state.users = [];
      state.groups = [{ name: '' }];
    },
    setUserNameByIndex: (state, action: PayloadAction<UserPayload>) => {
      state.users[action.payload.index].name = action.payload.name;
    },
    setUserPasswordByIndex: (
      state,
      action: PayloadAction<UserPasswordPayload>,
    ) => {
      state.users[action.payload.index].password = action.payload.password;
    },
    setUserSshKeyByIndex: (state, action: PayloadAction<UserSshKeyPayload>) => {
      state.users[action.payload.index].ssh_key = action.payload.sshKey;
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>,
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.users[index];

      user.isAdministrator = isAdministrator;
      if (isAdministrator) {
        if (!user.groups.includes('wheel')) {
          user.groups.push('wheel');
        }
      } else {
        user.groups = user.groups.filter((group) => group !== 'wheel');
      }
    },
    addGroupToUserByUserIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const { index, group } = action.payload;
      if (
        !state.users[index].groups.some(
          (existingGroup) => existingGroup === group,
        )
      ) {
        state.users[index].groups.push(group);

        if (group === 'wheel') {
          state.users[index].isAdministrator = true;
        }
      }
    },
    removeGroupFromUserByIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const groupIndex = state.users[action.payload.index].groups.findIndex(
        (group) => group === action.payload.group,
      );
      if (groupIndex !== -1) {
        if (action.payload.group === 'wheel') {
          state.users[action.payload.index].isAdministrator = false;
        }
        state.users[action.payload.index].groups.splice(groupIndex, 1);
      }
    },
    addUserGroup: (state) => {
      state.groups.push({ name: '' });
    },
    upsertUserGroup: (
      state,
      action: PayloadAction<
        { group: Group } | { index: number; group: Partial<Group> }
      >,
    ) => {
      if (!('index' in action.payload)) {
        state.groups.push(action.payload.group);
        return;
      }

      const { index, group } = action.payload;
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= state.groups.length
      ) {
        return;
      }

      state.groups[index] = {
        ...state.groups[index],
        ...group,
      };

      if ('gid' in group && group.gid === undefined) {
        delete state.groups[index].gid;
      }
    },
    setUserGroupNameByIndex: (
      state,
      action: PayloadAction<{ index: number; name: string }>,
    ) => {
      const { index, name } = action.payload;
      state.groups[index].name = name.trim();
      if (name.trim() === '') {
        delete state.groups[index].gid;
      }
    },
    setUserGroupGidByIndex: (
      state,
      action: PayloadAction<{ index: number; gid?: number | undefined }>,
    ) => {
      const { index, gid } = action.payload;
      if (gid === undefined) {
        delete state.groups[index].gid;
      } else {
        state.groups[index].gid = gid;
      }
    },
    removeUserGroup: (state, action: PayloadAction<number>) => {
      state.groups = state.groups.filter(
        (_, index) => index !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).users ??
          initialState,
      );
  },
});

export const {
  addUserGroup,
  upsertUserGroup,
  setUserGroupNameByIndex,
  setUserGroupGidByIndex,
  removeUserGroup,
  addUser,
  removeUser,
  clearUsersAndGroups,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  addGroupToUserByUserIndex,
  removeGroupFromUserByIndex,
} = usersSlice.actions;
