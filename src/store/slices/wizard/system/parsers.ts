import { FIRSTBOOT_PATH } from '@/constants';
import { Customizations } from '@/store/api/backend';

import { initialState } from './state';
import { SystemSlice } from './types';

import { RequestLike } from '../types';

const parseServices = ({
  services,
}: Customizations): SystemSlice['services'] => {
  const defaults = initialState.services;
  if (!services) {
    return defaults;
  }

  return {
    enabled: services.enabled || defaults.enabled,
    disabled: services.disabled || defaults.disabled,
    masked: services.masked || defaults.masked,
  };
};

const parseKernel = ({ kernel }: Customizations): SystemSlice['kernel'] => {
  const defaults = initialState.kernel;
  if (!kernel) {
    return defaults;
  }

  return {
    name: kernel.name || defaults.name,
    append: kernel.append?.split(' ') || defaults.append,
  };
};

const parseLocale = ({ locale }: Customizations): SystemSlice['locale'] => {
  if (!locale) {
    // NOTE: we can't return the default here because we would
    // populate the languages with `C.UTF-8`
    return { languages: [], keyboard: '' };
  }

  return {
    languages: locale.languages,
    keyboard: locale.keyboard,
  };
};

const parseTimezone = ({
  timezone,
}: Customizations): SystemSlice['timezone'] => {
  if (!timezone) {
    return initialState.timezone;
  }

  return {
    timezone: timezone.timezone,
    ntpservers: timezone.ntpservers,
  };
};

const parseHostname = ({
  hostname,
}: Customizations): SystemSlice['hostname'] => {
  if (!hostname) {
    return initialState.hostname;
  }

  return hostname;
};

const parseFirewall = ({
  firewall,
}: Customizations): SystemSlice['firewall'] => {
  const defaults = initialState.firewall;
  if (!firewall) {
    return defaults;
  }

  return {
    ports: firewall.ports || defaults.ports,
    services: {
      enabled: firewall.services?.enabled || defaults.services.enabled,
      disabled: firewall.services?.disabled || defaults.services.disabled,
    },
  };
};

const parseFirstBoot = ({
  files,
}: Customizations): SystemSlice['firstBoot'] => {
  const firstbootFile = files?.find((file) => file.path === FIRSTBOOT_PATH);
  if (!firstbootFile || !firstbootFile.data) {
    return initialState.firstBoot;
  }

  return {
    script: atob(firstbootFile.data),
  };
};

const parseUsers = ({ users }: Customizations): SystemSlice['users'] => {
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

const parseGroups = ({ groups }: Customizations): SystemSlice['groups'] => {
  if (!groups || groups.length === 0) {
    return initialState.groups;
  }

  return groups.map((group) => ({
    name: group.name,
    ...(group.gid && { gid: group.gid }),
  }));
};

export const parseSystemFromRequest = ({
  customizations,
}: RequestLike): SystemSlice => ({
  services: parseServices(customizations),
  kernel: parseKernel(customizations),
  locale: parseLocale(customizations),
  timezone: parseTimezone(customizations),
  hostname: parseHostname(customizations),
  firewall: parseFirewall(customizations),
  firstBoot: parseFirstBoot(customizations),
  users: parseUsers(customizations),
  groups: parseGroups(customizations),
});
