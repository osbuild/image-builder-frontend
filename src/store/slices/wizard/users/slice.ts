import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { initialState } from './state';
import { Group, User } from './types';

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
        hasPassword: false,
      };

      state.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter((_, index) => index !== action.payload);
    },
    clearUsersAndGroups: (_) => initialState,
    upsertUser: (
      state,
      action: PayloadAction<
        { user: User } | { index: number; user: Partial<User> }
      >,
    ) => {
      if (!('index' in action.payload)) {
        state.users.push(action.payload.user);
        return;
      }

      const { index, user } = action.payload;
      if (!Number.isInteger(index) || index < 0) {
        return;
      }

      state.users[index] = {
        ...state.users[index],
        ...user,
      };
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
  upsertUserGroup,
  removeUserGroup,
  addUser,
  upsertUser,
  removeUser,
  clearUsersAndGroups,
} = usersSlice.actions;
