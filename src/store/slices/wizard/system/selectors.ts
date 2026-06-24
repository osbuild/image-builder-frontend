import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

import { getLangpackNameForLocale } from './utilities';

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
