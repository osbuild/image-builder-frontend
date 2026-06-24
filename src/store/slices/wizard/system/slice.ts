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

export const systemSlice = createSlice({
  name: 'wizard/system',
  initialState,
  reducers: {
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.locale.languages &&
        !state.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.locale.languages) {
        const index = state.locale.languages.findIndex(
          (lang) => lang === action.payload,
        );
        if (index !== -1) {
          state.locale.languages.splice(index, 1);
        }
      }
    },
    replaceLanguage: (
      state,
      action: PayloadAction<{ oldLanguage: string; newLanguage: string }>,
    ) => {
      if (state.locale.languages) {
        const index = state.locale.languages.findIndex(
          (lang) => lang === action.payload.oldLanguage,
        );
        if (index === -1) return;

        const isDuplicate = state.locale.languages.some(
          // ← NEW
          (lang, i) => i !== index && lang === action.payload.newLanguage,
        );
        if (isDuplicate) return; // ← NEW

        state.locale.languages[index] = action.payload.newLanguage;
      }
    },
    clearLanguages: (state) => {
      state.locale.languages = [];
    },
    clearLocale: (state) => {
      state.locale.languages = [];
      state.locale.keyboard = '';
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.locale.keyboard = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      state.firstBoot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.enabled.some((service) => service === action.payload)
      ) {
        state.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.enabled.splice(index, 1);
      }
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.masked.some((service) => service === action.payload)
      ) {
        state.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      const index = state.services.masked.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.masked.splice(index, 1);
      }
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.services.disabled.some((service) => service === action.payload)
      ) {
        state.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      const index = state.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.services.disabled.splice(index, 1);
      }
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.kernel.append.findIndex(
        (arg) => arg === action.payload,
      );

      if (existingArgIndex !== -1) {
        state.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.kernel.append.length > 0) {
        const index = state.kernel.append.findIndex(
          (arg) => arg === action.payload,
        );
        if (index !== -1) {
          state.kernel.append.splice(index, 1);
        }
      }
    },
    clearKernelAppend: (state) => {
      state.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.enabled.splice(index, 1);
      }
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.firewall.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.firewall.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.firewall.services.disabled.splice(index, 1);
      }
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.timezone.ntpservers?.some((server) => server === action.payload)
      ) {
        state.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      if (state.timezone.ntpservers) {
        const index = state.timezone.ntpservers.findIndex(
          (server) => server === action.payload,
        );
        if (index !== -1) {
          state.timezone.ntpservers.splice(index, 1);
        }
      }
    },
    clearTimezone: (state) => {
      state.timezone.timezone = '';
      state.timezone.ntpservers = [];
    },
    changeHostname: (state, action: PayloadAction<string>) => {
      state.hostname = action.payload;
    },
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
    addPort: (state, action: PayloadAction<string>) => {
      if (!state.firewall.ports.some((port) => port === action.payload)) {
        state.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      const index = state.firewall.ports.findIndex(
        (port) => port === action.payload,
      );
      if (index !== -1) {
        state.firewall.ports.splice(index, 1);
      }
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>,
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.users[index];

      user.isAdministrator = isAdministrator;
      if (isAdministrator) {
        user.groups.push('wheel');
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
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `system` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).system ??
          initialState,
      );
  },
});

export const {
  addUserGroup,
  setUserGroupNameByIndex,
  setUserGroupGidByIndex,
  removeUserGroup,
  addLanguage,
  removeLanguage,
  replaceLanguage,
  clearLanguages,
  clearLocale,
  changeKeyboard,
  setFirstBootScript,
  changeEnabledServices,
  addEnabledService,
  removeEnabledService,
  changeMaskedServices,
  addMaskedService,
  removeMaskedService,
  changeDisabledServices,
  addDisabledService,
  removeDisabledService,
  changeKernelName,
  addKernelArg,
  removeKernelArg,
  clearKernelAppend,
  addDisabledFirewallService,
  removeDisabledFirewallService,
  addEnabledFirewallService,
  removeEnabledFirewallService,
  changeTimezone,
  addNtpServer,
  removeNtpServer,
  clearTimezone,
  changeHostname,
  addPort,
  removePort,
  addUser,
  removeUser,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  setUserAdministratorByIndex,
  addGroupToUserByUserIndex,
  removeGroupFromUserByIndex,
} = systemSlice.actions;
