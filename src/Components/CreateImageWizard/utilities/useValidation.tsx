import { useEffect, useState } from 'react';

import { UNIQUE_VALIDATION_DELAY } from '../../../constants';
import { useLazyGetBlueprintsQuery } from '../../../store/backendApi';
import { useAppSelector } from '../../../store/hooks';
import { BlueprintsResponse } from '../../../store/imageBuilderApi';
import {
  useListActivationKeysQuery,
  useShowActivationKeyQuery,
} from '../../../store/rhsmApi';
import {
  selectBlueprintId,
  selectBlueprintName,
  selectBlueprintDescription,
  selectFileSystemConfigurationType,
  selectFirstBootScript,
  selectPartitions,
  selectSnapshotDate,
  selectUseLatest,
  selectActivationKey,
  selectRegistrationType,
  selectHostname,
  selectKernel,
  selectUserNameByIndex,
  selectUsers,
  selectUserPasswordByIndex,
  selectUserSshKeyByIndex,
  selectNtpServers,
  selectFirewall,
  selectServices,
  selectLanguages,
  selectKeyboard,
  selectTimezone,
} from '../../../store/wizardSlice';
import { keyboardsList } from '../steps/Locale/keyboardsList';
import { languagesList } from '../steps/Locale/languagesList';
import { timezones } from '../steps/Timezone/timezonesList';
import {
  getDuplicateMountPoints,
  isBlueprintNameValid,
  isBlueprintDescriptionValid,
  isMountpointMinSizeValid,
  isSnapshotValid,
  isHostnameValid,
  isKernelNameValid,
  isUserNameValid,
  isSshKeyValid,
  isNtpServerValid,
  isKernelArgumentValid,
  isPortValid,
  isServiceValid,
} from '../validators';

export type StepValidation = {
  errors: {
    [key: string]: string;
  };
  disabledNext: boolean;
};

export function useIsBlueprintValid(): boolean {
  const registration = useRegistrationValidation();
  const filesystem = useFilesystemValidation();
  const snapshot = useSnapshotValidation();
  const timezone = useTimezoneValidation();
  const locale = useLocaleValidation();
  const hostname = useHostnameValidation();
  const kernel = useKernelValidation();
  const firewall = useFirewallValidation();
  const services = useServicesValidation();
  const firstBoot = useFirstBootValidation();
  const details = useDetailsValidation();
  return (
    !registration.disabledNext &&
    !filesystem.disabledNext &&
    !snapshot.disabledNext &&
    !timezone.disabledNext &&
    !locale.disabledNext &&
    !hostname.disabledNext &&
    !kernel.disabledNext &&
    !firewall.disabledNext &&
    !services.disabledNext &&
    !firstBoot.disabledNext &&
    !details.disabledNext
  );
}

export function useRegistrationValidation(): StepValidation {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);

  const {
    isUninitialized,
    isFetching: isFetchingKeys,
    isError: isErrorKeys,
  } = useListActivationKeysQuery();

  const { isFetching: isFetchingKeyInfo, isError: isErrorKeyInfo } =
    useShowActivationKeyQuery(
      { name: activationKey! },
      {
        skip: !activationKey,
      }
    );

  if (registrationType !== 'register-later' && !activationKey) {
    if (isUninitialized || isFetchingKeys || !isErrorKeys) {
      return { errors: {}, disabledNext: false };
    }
    return {
      errors: { activationKey: 'No activation key selected' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-later' &&
    activationKey &&
    (isFetchingKeyInfo || isErrorKeyInfo)
  ) {
    return {
      errors: { activationKey: 'Invalid activation key' },
      disabledNext: true,
    };
  }

  return { errors: {}, disabledNext: false };
}

export function useFilesystemValidation(): StepValidation {
  const mode = useAppSelector(selectFileSystemConfigurationType);
  const partitions = useAppSelector(selectPartitions);
  let disabledNext = false;

  const errors: { [key: string]: string } = {};
  if (mode === 'automatic') {
    return { errors, disabledNext: false };
  }

  const duplicates = getDuplicateMountPoints(partitions);
  for (const partition of partitions) {
    if (!isMountpointMinSizeValid(partition.min_size)) {
      errors[`min-size-${partition.id}`] = 'Must be larger than 0';
      disabledNext = true;
    }
    if (duplicates.includes(partition.mountpoint)) {
      errors[`mountpoint-${partition.id}`] = 'Duplicate mount points';
      disabledNext = true;
    }
  }
  return { errors, disabledNext };
}

export function useSnapshotValidation(): StepValidation {
  const snapshotDate = useAppSelector(selectSnapshotDate);
  const useLatest = useAppSelector(selectUseLatest);

  if (!useLatest && !isSnapshotValid(snapshotDate)) {
    return {
      errors: { snapshotDate: 'Invalid snapshot date' },
      disabledNext: true,
    };
  }
  return { errors: {}, disabledNext: false };
}

export function useTimezoneValidation(): StepValidation {
  const timezone = useAppSelector(selectTimezone);
  const ntpServers = useAppSelector(selectNtpServers);
  const invalidServers = [];

  if (ntpServers) {
    for (const server of ntpServers) {
      if (!isNtpServerValid(server)) {
        invalidServers.push(server);
      }
    }
  }

  const timezoneError =
    timezone && !timezones.includes(timezone) ? 'Unknown timezone' : '';
  const ntpServersError =
    invalidServers.length > 0 ? `Invalid NTP servers: ${invalidServers}` : '';

  return {
    errors: { timezone: timezoneError, ntpServers: ntpServersError },
    disabledNext: timezoneError !== '' || invalidServers.length > 0,
  };
}

export function useLocaleValidation(): StepValidation {
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  const errors = {};
  const unknownLanguages = [];

  if (languages && languages.length > 0) {
    for (const lang of languages) {
      if (!languagesList.includes(lang)) {
        unknownLanguages.push(lang);
      }
    }
  }

  const languagesError =
    unknownLanguages.length > 0 ? unknownLanguages.join(' ') : '';
  const keyboardError =
    keyboard && !keyboardsList.includes(keyboard) ? 'Unknown keyboard' : '';

  return {
    errors: { languages: languagesError, keyboard: keyboardError },
    disabledNext: unknownLanguages.length > 0 || 'keyboard' in errors,
  };
}

export function useFirstBootValidation(): StepValidation {
  const script = useAppSelector(selectFirstBootScript);
  let hasShebang = false;
  if (script) {
    hasShebang = script.split('\n')[0].startsWith('#!');
  }
  const valid = !script || hasShebang;
  return {
    errors: {
      script: valid ? '' : 'Missing shebang at first line, e.g. #!/bin/bash',
    },
    disabledNext: !valid,
  };
}

export function useHostnameValidation(): StepValidation {
  const hostname = useAppSelector(selectHostname);

  // Error message taken from hostname man page (`man 5 hostname`)
  const errorMessage =
    'Invalid hostname. The hostname should be composed of up to 64 7-bit ASCII lower-case alphanumeric characters or hyphens forming a valid DNS domain name. It is recommended that this name contains only a single label, i.e. without any dots.';

  const hostnameError = !isHostnameValid(hostname) ? errorMessage : '';

  return {
    errors: {
      hostname: hostnameError,
    },
    disabledNext: !!hostnameError,
  };
}

export function useKernelValidation(): StepValidation {
  const kernel = useAppSelector(selectKernel);

  const invalidArgs = [];
  if (kernel.append.length > 0) {
    for (const arg of kernel.append) {
      if (!isKernelArgumentValid(arg)) {
        invalidArgs.push(arg);
      }
    }
  }

  const kernelNameError = !isKernelNameValid(kernel.name)
    ? 'Invalid format.'
    : '';

  const kernelAppendError =
    invalidArgs.length > 0 ? `Invalid kernel arguments: ${invalidArgs}` : '';

  return {
    errors: { kernel: kernelNameError, kernelAppend: kernelAppendError },
    disabledNext: kernelNameError !== '' || kernelAppendError !== '',
  };
}

export function useFirewallValidation(): StepValidation {
  const firewall = useAppSelector(selectFirewall);
  const invalidPorts = [];
  const invalidDisabled = [];
  const invalidEnabled = [];

  if (firewall.ports.length > 0) {
    for (const port of firewall.ports) {
      if (!isPortValid(port)) {
        invalidPorts.push(port);
      }
    }
  }

  if (firewall.services.disabled.length > 0) {
    for (const s of firewall.services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }
  }

  if (firewall.services.enabled.length > 0) {
    for (const s of firewall.services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }
  }

  const portsError =
    invalidPorts.length > 0 ? `Invalid ports: ${invalidPorts}` : '';
  const disabledServicesError =
    invalidDisabled.length > 0
      ? `Invalid disabled services: ${invalidDisabled}`
      : '';
  const enabledServicesError =
    invalidEnabled.length > 0
      ? `Invalid enabled services: ${invalidEnabled}`
      : '';

  return {
    errors: {
      ports: portsError,
      disabledServices: disabledServicesError,
      enabledServices: enabledServicesError,
    },
    disabledNext:
      invalidPorts.length > 0 ||
      invalidDisabled.length > 0 ||
      invalidEnabled.length > 0,
  };
}

export function useServicesValidation(): StepValidation {
  const services = useAppSelector(selectServices);

  const invalidDisabled = [];
  const invalidMasked = [];
  const invalidEnabled = [];

  if (services.disabled.length > 0) {
    for (const s of services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }
  }

  if (services.masked.length > 0) {
    for (const s of services.masked) {
      if (!isServiceValid(s)) {
        invalidMasked.push(s);
      }
    }
  }

  if (services.enabled.length > 0) {
    for (const s of services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }
  }

  const disabledSystemdServicesError =
    invalidDisabled.length > 0
      ? `Invalid disabled services: ${invalidDisabled}`
      : '';
  const maskedSystemdServicesError =
    invalidMasked.length > 0 ? `Invalid masked services: ${invalidMasked}` : '';
  const enabledSystemdServicesError =
    invalidEnabled.length > 0
      ? `Invalid enabled services: ${invalidEnabled}`
      : '';

  return {
    errors: {
      disabledSystemdServices: disabledSystemdServicesError,
      maskedSystemdServices: maskedSystemdServicesError,
      enabledSystemdServices: enabledSystemdServicesError,
    },
    disabledNext:
      invalidDisabled.length > 0 ||
      invalidMasked.length > 0 ||
      invalidEnabled.length > 0,
  };
}

export function useUsersValidation(): StepValidation {
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const users = useAppSelector(selectUsers);
  const canProceed =
    // Case 1: there is no users
    users.length === 0 ||
    // Case 2: All fields are empty
    (userName === '' && userPassword === '' && userSshKey === '') ||
    // Case 3: userName is valid and SshKey is valid
    (userName &&
      isUserNameValid(userName) &&
      userSshKey &&
      isSshKeyValid(userSshKey));

  return {
    errors: {
      userName:
        userName && !isUserNameValid(userName) ? 'Invalid user name' : '',
      userSshKey:
        userSshKey && !isSshKeyValid(userSshKey) ? 'Invalid SSH key' : '',
    },
    disabledNext: !canProceed,
  };
}

export function useDetailsValidation(): StepValidation {
  const name = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const blueprintId = useAppSelector(selectBlueprintId);

  const nameValid = isBlueprintNameValid(name);
  const [uniqueName, setUniqueName] = useState<boolean | null>(null);

  const [trigger] = useLazyGetBlueprintsQuery();

  // Debounce the API call to check if the name is unique
  useEffect(() => {
    if (name !== '' && nameValid) {
      const timer = setTimeout(
        () => {
          setUniqueName(null);
          trigger({ name })
            .unwrap()
            .then((response: BlueprintsResponse) => {
              if (
                response?.meta?.count > 0 &&
                response.data[0].id !== blueprintId
              ) {
                setUniqueName(false);
              } else {
                setUniqueName(true);
              }
            })
            .catch(() => {
              // If the request fails, we assume the name is unique
              setUniqueName(true);
            });
        },
        UNIQUE_VALIDATION_DELAY // If name is empty string, instantly return
      );

      return () => {
        clearTimeout(timer);
      };
    }
  }, [blueprintId, name, setUniqueName, trigger, nameValid]);

  let nameError = '';
  if (!name) {
    nameError = 'Blueprint name is required';
  }
  if (name && !nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (uniqueName === false) {
    nameError = 'Blueprint with this name already exists';
  } else if (!blueprintId && uniqueName === null) {
    // Hack to keep the error message from flickering in create mode
    return { errors: { name: '' }, disabledNext: false };
  }

  const descriptionError = !isBlueprintDescriptionValid(description)
    ? 'Invalid description'
    : '';

  return {
    errors: {
      name: nameError,
      description: descriptionError,
    },
    // if uniqueName is null, we are still waiting for the API response
    disabledNext: !!nameError || !!descriptionError || uniqueName !== true,
  };
}
