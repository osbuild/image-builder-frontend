import {
  createSelector,
  createSlice,
  PayloadAction,
  Reducer,
} from '@reduxjs/toolkit';

import type { RootState } from '@/store';

import { initializeWizard, loadWizardState } from './actions';
import { cloudProvidersSlice, cloudProvidersState } from './cloud';
import { complianceSlice, complianceState } from './compliance';
import { contentSlice, contentState } from './content';
import { detailsSlice, detailsState } from './details';
import { filesystemSlice, filesystemState } from './filesystem';
import { outputSlice, outputState } from './output';
import { registrationSlice, registrationState } from './registration';
import {
  UserAdministratorPayload,
  UserGroupGidPayload,
  UserGroupNamePayload,
  UserGroupPayload,
  UserPasswordPayload,
  UserPayload,
  UserSshKeyPayload,
} from './system';
import { CombinedWizardState, WizardState } from './types';

// GID range for regular groups per LOGIN.DEFS(5) defaults
export const MIN_REGULAR_GID = 1000;
export const MAX_REGULAR_GID = 60000;

export const initialState: WizardState = {
  system: {
    services: {
      enabled: [],
      masked: [],
      disabled: [],
    },
    kernel: {
      name: '',
      append: [],
    },
    locale: {
      languages: ['C.UTF-8'],
      keyboard: '',
    },
    timezone: {
      timezone: '',
      ntpservers: [],
    },
    hostname: '',
    firewall: {
      ports: [],
      services: {
        enabled: [],
        disabled: [],
      },
    },
    firstBoot: { script: '' },
    users: [],
    groups: [{ name: '' }],
  },
};

export const selectServices = (state: RootState) => {
  return state.wizard.system.services;
};

export const selectUsers = (state: RootState) => {
  return state.wizard.system.users;
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
  return state.wizard.system.groups;
};

export const selectNonEmptyUserGroups = createSelector(
  [selectUserGroups],
  (groups) => groups.filter((group) => group.name.trim() || group.gid),
);

export const selectKernel = (state: RootState) => {
  return state.wizard.system.kernel;
};

export const selectLanguages = (state: RootState) => {
  return state.wizard.system.locale.languages;
};

export const selectKeyboard = (state: RootState) => {
  return state.wizard.system.locale.keyboard;
};

export const selectFirstBootScript = (state: RootState) => {
  return state.wizard.system.firstBoot.script;
};

export const selectTimezone = (state: RootState) => {
  return state.wizard.system.timezone.timezone;
};

export const selectNtpServers = (state: RootState) => {
  return state.wizard.system.timezone.ntpservers;
};

export const selectHostname = (state: RootState) => {
  return state.wizard.system.hostname;
};

export const selectFirewall = (state: RootState) => {
  return state.wizard.system.firewall;
};

const extractLanguageCode = (locale: string): string | undefined => {
  const [regionPart] = locale.split('.');
  const [languageCode] = regionPart.split('_');
  if (!languageCode) {
    return undefined;
  }
  const lc = languageCode.toLowerCase();
  if (lc === 'c') {
    return undefined;
  }
  return lc;
};

const getLangpackNameForLocale = (locale: string): string | undefined => {
  const code = extractLanguageCode(locale);
  return code ? `langpacks-${code}` : undefined;
};

export const selectLocaleLangpackCandidates = createSelector(
  [selectLanguages],
  (languages) => {
    const set = new Set<string>();
    for (const lang of languages ?? []) {
      const pkg = getLangpackNameForLocale(lang);
      if (pkg) {
        set.add(pkg);
      }
    }
    return Array.from(set);
  },
);

export const selectFirewallEnabled = createSelector(
  [selectFirewall],
  (firewall) => {
    if (firewall.ports.length > 0) return true;
    if (firewall.services.enabled.length > 0) return true;
    if (firewall.services.disabled.length > 0) return true;
    return false;
  },
);

export const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    addLanguage: (state, action: PayloadAction<string>) => {
      if (
        state.system.locale.languages &&
        !state.system.locale.languages.some((lang) => lang === action.payload)
      ) {
        state.system.locale.languages.push(action.payload);
      }
    },
    removeLanguage: (state, action: PayloadAction<string>) => {
      if (state.system.locale.languages) {
        const index = state.system.locale.languages.findIndex(
          (lang) => lang === action.payload,
        );
        if (index !== -1) {
          state.system.locale.languages.splice(index, 1);
        }
      }
    },
    replaceLanguage: (
      state,
      action: PayloadAction<{ oldLanguage: string; newLanguage: string }>,
    ) => {
      if (state.system.locale.languages) {
        const index = state.system.locale.languages.findIndex(
          (lang) => lang === action.payload.oldLanguage,
        );
        if (index === -1) return;

        const isDuplicate = state.system.locale.languages.some(
          (lang, i) => i !== index && lang === action.payload.newLanguage,
        );
        if (isDuplicate) return;

        state.system.locale.languages[index] = action.payload.newLanguage;
      }
    },
    clearLanguages: (state) => {
      state.system.locale.languages = [];
    },
    clearLocale: (state) => {
      state.system.locale.languages = [];
      state.system.locale.keyboard = '';
    },
    changeKeyboard: (state, action: PayloadAction<string>) => {
      state.system.locale.keyboard = action.payload;
    },
    setFirstBootScript: (state, action: PayloadAction<string>) => {
      state.system.firstBoot.script = action.payload;
    },
    changeEnabledServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.enabled = action.payload;
    },
    addEnabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.enabled.push(action.payload);
      }
    },
    removeEnabledService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.enabled.splice(index, 1);
      }
    },
    changeMaskedServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.masked = action.payload;
    },
    addMaskedService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.masked.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.masked.push(action.payload);
      }
    },
    removeMaskedService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.masked.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.masked.splice(index, 1);
      }
    },
    changeDisabledServices: (state, action: PayloadAction<string[]>) => {
      state.system.services.disabled = action.payload;
    },
    addDisabledService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.services.disabled.push(action.payload);
      }
    },
    removeDisabledService: (state, action: PayloadAction<string>) => {
      const index = state.system.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.services.disabled.splice(index, 1);
      }
    },
    changeKernelName: (state, action: PayloadAction<string>) => {
      state.system.kernel.name = action.payload;
    },
    addKernelArg: (state, action: PayloadAction<string>) => {
      const existingArgIndex = state.system.kernel.append.findIndex(
        (arg) => arg === action.payload,
      );

      if (existingArgIndex !== -1) {
        state.system.kernel.append[existingArgIndex] = action.payload;
      } else {
        state.system.kernel.append.push(action.payload);
      }
    },
    removeKernelArg: (state, action: PayloadAction<string>) => {
      if (state.system.kernel.append.length > 0) {
        const index = state.system.kernel.append.findIndex(
          (arg) => arg === action.payload,
        );
        if (index !== -1) {
          state.system.kernel.append.splice(index, 1);
        }
      }
    },
    clearKernelAppend: (state) => {
      state.system.kernel.append = [];
    },
    addEnabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.services.enabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.firewall.services.enabled.push(action.payload);
      }
    },
    removeEnabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.services.enabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.services.enabled.splice(index, 1);
      }
    },
    addDisabledFirewallService: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.services.disabled.some(
          (service) => service === action.payload,
        )
      ) {
        state.system.firewall.services.disabled.push(action.payload);
      }
    },
    removeDisabledFirewallService: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.services.disabled.findIndex(
        (service) => service === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.services.disabled.splice(index, 1);
      }
    },
    changeTimezone: (state, action: PayloadAction<string>) => {
      state.system.timezone.timezone = action.payload;
    },
    addNtpServer: (state, action: PayloadAction<string>) => {
      if (
        !state.system.timezone.ntpservers?.some(
          (server) => server === action.payload,
        )
      ) {
        state.system.timezone.ntpservers?.push(action.payload);
      }
    },
    removeNtpServer: (state, action: PayloadAction<string>) => {
      if (state.system.timezone.ntpservers) {
        const index = state.system.timezone.ntpservers.findIndex(
          (server) => server === action.payload,
        );
        if (index !== -1) {
          state.system.timezone.ntpservers.splice(index, 1);
        }
      }
    },
    clearTimezone: (state) => {
      state.system.timezone.timezone = '';
      state.system.timezone.ntpservers = [];
    },
    changeHostname: (state, action: PayloadAction<string>) => {
      state.system.hostname = action.payload;
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

      state.system.users.push(newUser);
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.system.users = state.system.users.filter(
        (_, index) => index !== action.payload,
      );
    },
    setUserNameByIndex: (state, action: PayloadAction<UserPayload>) => {
      state.system.users[action.payload.index].name = action.payload.name;
    },
    setUserPasswordByIndex: (
      state,
      action: PayloadAction<UserPasswordPayload>,
    ) => {
      state.system.users[action.payload.index].password =
        action.payload.password;
    },
    setUserSshKeyByIndex: (state, action: PayloadAction<UserSshKeyPayload>) => {
      state.system.users[action.payload.index].ssh_key = action.payload.sshKey;
    },
    addPort: (state, action: PayloadAction<string>) => {
      if (
        !state.system.firewall.ports.some((port) => port === action.payload)
      ) {
        state.system.firewall.ports.push(action.payload);
      }
    },
    removePort: (state, action: PayloadAction<string>) => {
      const index = state.system.firewall.ports.findIndex(
        (port) => port === action.payload,
      );
      if (index !== -1) {
        state.system.firewall.ports.splice(index, 1);
      }
    },
    setUserAdministratorByIndex: (
      state,
      action: PayloadAction<UserAdministratorPayload>,
    ) => {
      const { index, isAdministrator } = action.payload;
      const user = state.system.users[index];

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
        !state.system.users[index].groups.some(
          (existingGroup) => existingGroup === group,
        )
      ) {
        state.system.users[index].groups.push(group);

        if (group === 'wheel') {
          state.system.users[index].isAdministrator = true;
        }
      }
    },
    removeGroupFromUserByIndex: (
      state,
      action: PayloadAction<UserGroupPayload>,
    ) => {
      const groupIndex = state.system.users[
        action.payload.index
      ].groups.findIndex((group) => group === action.payload.group);
      if (groupIndex !== -1) {
        if (action.payload.group === 'wheel') {
          state.system.users[action.payload.index].isAdministrator = false;
        }
        state.system.users[action.payload.index].groups.splice(groupIndex, 1);
      }
    },
    addUserGroup: (state) => {
      const existingGids = new Set(
        state.system.groups
          .map((g) => g.gid)
          .filter((gid): gid is number => gid !== undefined),
      );
      let nextGid = MIN_REGULAR_GID;
      while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
        nextGid++;
      }
      if (nextGid <= MAX_REGULAR_GID) {
        state.system.groups.push({ name: '', gid: nextGid });
      } else {
        state.system.groups.push({ name: '' });
      }
    },
    setUserGroupNameByIndex: (
      state,
      action: PayloadAction<UserGroupNamePayload>,
    ) => {
      const { index, name } = action.payload;
      state.system.groups[index].name = name.trim();
      if (name.trim() === '') {
        delete state.system.groups[index].gid;
      } else if (state.system.groups[index].gid === undefined) {
        const existingGids = new Set(
          state.system.groups
            .map((g) => g.gid)
            .filter((gid): gid is number => gid !== undefined),
        );
        let nextGid = MIN_REGULAR_GID;
        while (existingGids.has(nextGid) && nextGid <= MAX_REGULAR_GID) {
          nextGid++;
        }
        if (nextGid <= MAX_REGULAR_GID) {
          state.system.groups[index].gid = nextGid;
        }
      }
    },
    setUserGroupGidByIndex: (
      state,
      action: PayloadAction<UserGroupGidPayload>,
    ) => {
      const { index, gid } = action.payload;
      if (gid === undefined) {
        delete state.system.groups[index].gid;
      } else {
        state.system.groups[index].gid = gid;
      }
    },
    removeUserGroup: (state, action: PayloadAction<number>) => {
      state.system.groups = state.system.groups.filter(
        (_, index) => index !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        (_, action: PayloadAction<WizardState>) => action.payload,
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
} = wizardSlice.actions;

// we can't use RTK query's `combineSlices` helper yet, we
// first need to convert all the items into submodules and
// then we can compose the slice using the `combineSlices`.
// The reason for this is that there is no way to nest the
// child slice under the parent slice yet, we would need
// to temporarily change the slice shape, which is not ideal
export const combinedInitialState: CombinedWizardState = {
  ...initialState,
  cloudProviders: cloudProvidersState,
  compliance: complianceState,
  content: contentState,
  details: detailsState,
  filesystem: filesystemState,
  output: outputState,
  registration: registrationState,
};

export const wizardReducer: Reducer<CombinedWizardState> = (state, action) => {
  const coreState = wizardSlice.reducer(
    state as WizardState | undefined,
    action,
  );
  return {
    ...coreState,
    cloudProviders: cloudProvidersSlice.reducer(state?.cloudProviders, action),
    compliance: complianceSlice.reducer(state?.compliance, action),
    content: contentSlice.reducer(state?.content, action),
    details: detailsSlice.reducer(state?.details, action),
    filesystem: filesystemSlice.reducer(state?.filesystem, action),
    output: outputSlice.reducer(state?.output, action),
    registration: registrationSlice.reducer(state?.registration, action),
  };
};
