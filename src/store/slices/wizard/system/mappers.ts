import { createSelector } from '@reduxjs/toolkit';

import {
  FIRST_BOOT_SERVICE_DATA,
  FIRSTBOOT_PATH,
  FIRSTBOOT_SERVICE_PATH,
} from '@/constants';
import type { File, Group, User } from '@/store/api/backend';

import {
  selectFirewall,
  selectFirstBootScript,
  selectHostname,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectServices,
  selectTimezone,
  selectUserGroups,
  selectUsers,
} from './selectors';
import { UserWithAdditionalInfo } from './types';

import { selectIsImageMode } from '../details';

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

const mapServices = createSelector([selectServices], (services) => {
  if (
    services.enabled.length === 0 &&
    services.masked.length === 0 &&
    services.disabled.length === 0
  ) {
    return undefined;
  }

  return {
    services: {
      enabled: services.enabled.length ? services.enabled : undefined,
      masked: services.masked.length ? services.masked : undefined,
      disabled: services.disabled.length ? services.disabled : undefined,
    },
  };
});

const mapHostname = createSelector([selectHostname], (hostname) => {
  if (!hostname) {
    return undefined;
  }

  return { hostname };
});

const mapKernel = createSelector([selectKernel], (kernel) => {
  const kernelAppendString = kernel.append.join(' ');

  const kernelRequest = {};

  if (!kernel.name && kernel.append.length === 0) {
    return undefined;
  }

  if (kernel.name) {
    Object.assign(kernelRequest, {
      name: kernel.name,
    });
  }

  if (kernelAppendString !== '') {
    Object.assign(kernelRequest, {
      append: kernelAppendString,
    });
  }

  if (Object.keys(kernelRequest).length === 0) {
    return undefined;
  }

  return {
    kernel: kernelRequest,
  };
});

const mapTimezoneField = createSelector([selectTimezone], (timezone) => {
  if (!timezone) {
    return undefined;
  }

  return { timezone };
});

const mapNtpServersField = createSelector([selectNtpServers], (ntpservers) => {
  if (ntpservers?.length === 0) {
    return undefined;
  }

  return { ntpservers };
});

const mapTimezone = createSelector(
  [mapTimezoneField, mapNtpServersField, selectIsImageMode],
  (timezone, ntpservers, isImageMode) => {
    if (isImageMode) {
      return undefined;
    }

    if (!timezone && !ntpservers) {
      return undefined;
    }

    return {
      timezone: {
        ...timezone,
        ...ntpservers,
      },
    };
  },
);

const mapLanguagesField = createSelector([selectLanguages], (languages) => {
  if (languages?.length === 0) {
    return undefined;
  }

  return { languages };
});

const mapKeyboardField = createSelector([selectKeyboard], (keyboard) => {
  if (!keyboard) {
    return undefined;
  }

  return { keyboard };
});

const mapLocale = createSelector(
  [mapLanguagesField, mapKeyboardField, selectIsImageMode],
  (languages, keyboard, isImageMode) => {
    if (isImageMode) {
      return undefined;
    }

    if (!languages && !keyboard) {
      return undefined;
    }

    return {
      locale: {
        ...languages,
        ...keyboard,
      },
    };
  },
);

const mapFirewall = createSelector([selectFirewall], (firewall) => {
  const ports = firewall.ports;
  const services = firewall.services;
  const fw = {};

  if (ports.length > 0) {
    Object.assign(fw, { ports: ports });
  }

  if (services.enabled.length > 0 || services.disabled.length > 0) {
    Object.assign(fw, {
      services: {
        enabled: services.enabled.length > 0 ? services.enabled : undefined,
        disabled: services.disabled.length > 0 ? services.disabled : undefined,
      },
    });
  }

  if (Object.keys(fw).length === 0) {
    return undefined;
  }

  return { firewall: fw };
});

// this needs to be exported because other slices
// also have file customizations
export const mapFirstbootFiles = createSelector(
  [selectFirstBootScript],
  (firstbootScript): File[] => {
    if (!firstbootScript) {
      return [];
    }

    // TODO: we really should figure out how to handle this
    // lower down in the stack rather than the frontend
    return [
      {
        path: FIRSTBOOT_SERVICE_PATH,
        data: FIRST_BOOT_SERVICE_DATA,
        data_encoding: 'base64',
        ensure_parents: true,
      },
      {
        path: FIRSTBOOT_PATH,
        data: btoa(firstbootScript),
        data_encoding: 'base64',
        mode: '0774',
        ensure_parents: true,
      },
    ];
  },
);

export const mapSystemCustomizations = createSelector(
  [
    mapUsers,
    mapGroups,
    mapServices,
    mapHostname,
    mapKernel,
    mapTimezone,
    mapLocale,
    mapFirewall,
  ],
  (users, groups, services, hostname, kernel, timezone, locale, firewall) => ({
    ...users,
    ...groups,
    ...services,
    ...hostname,
    ...kernel,
    ...timezone,
    ...locale,
    ...firewall,
  }),
);
