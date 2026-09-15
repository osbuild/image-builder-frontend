import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { MAX_REGULAR_GID, MIN_REGULAR_GID } from './constants';
import { initialState } from './state';
import {
  UserAdministratorPayload,
  UserGroupGidPayload,
  UserGroupNamePayload,
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
      const existingGids = new Set(
        state.groups
          .map((g) => g.gid)
          .filter((gid): gid is number => gid !== undefined),
      );
      let nextGid = MIN_REGULAR_GID;
      while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
        nextGid++;
      }
      if (nextGid <= MAX_REGULAR_GID) {
        state.groups.push({ name: '', gid: nextGid });
      } else {
        state.groups.push({ name: '' });
      }
    },
    setUserGroupNameByIndex: (
      state,
      action: PayloadAction<UserGroupNamePayload>,
    ) => {
      const { index, name } = action.payload;
      state.groups[index].name = name.trim();
      if (name.trim() === '') {
        delete state.groups[index].gid;
      } else if (state.groups[index].gid === undefined) {
        const existingGids = new Set(
          state.groups
            .map((g) => g.gid)
            .filter((gid): gid is number => gid !== undefined),
        );
        let nextGid = MIN_REGULAR_GID;
        while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
          nextGid++;
        }
        if (nextGid <= MAX_REGULAR_GID) {
          state.groups[index].gid = nextGid;
        }
      }
    },
    setUserGroupGidByIndex: (
      state,
      action: PayloadAction<UserGroupGidPayload>,
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
  setUserGroupNameByIndex,
  setUserGroupGidByIndex,
  removeUserGroup,
  addUser,
  removeUser,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  addGroupToUserByUserIndex,
  removeGroupFromUserByIndex,
} = usersSlice.actions;
