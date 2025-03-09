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
  selectImageTypes,
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
  isPasswordValid,
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
  const users = useUsersValidation();
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
    !details.disabledNext &&
    !users.disabledNext
  );
}

type ValidationFlags = {
  isUserNameValidValue: boolean;
  isSshKeyValidValue: boolean;
  isPasswordValidValue: boolean;
};

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
  const errors = {};

  if (timezone) {
    if (!timezones.includes(timezone)) {
      Object.assign(errors, { timezone: 'Unknown timezone' });
    }
  }

  if (ntpServers) {
    const invalidServers = [];

    for (const server of ntpServers) {
      if (!isNtpServerValid(server)) {
        invalidServers.push(server);
      }
    }

    if (invalidServers.length > 0) {
      Object.assign(errors, {
        ntpServers: `Invalid NTP servers: ${invalidServers}`,
      });
    }
  }

  return {
    errors: errors,
    disabledNext: 'timezone' in errors || 'ntpServers' in errors,
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

    if (unknownLanguages.length > 0) {
      Object.assign(errors, {
        languages: unknownLanguages.join(' '),
      });
    }
  }

  if (keyboard && !keyboardsList.includes(keyboard)) {
    Object.assign(errors, { keyboard: 'Unknown keyboard' });
  }

  return {
    errors,
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

  if (!isHostnameValid(hostname)) {
    return {
      errors: {
        hostname: errorMessage,
      },
      disabledNext: true,
    };
  }
  return { errors: {}, disabledNext: false };
}

export function useKernelValidation(): StepValidation {
  const kernel = useAppSelector(selectKernel);

  if (!isKernelNameValid(kernel.name)) {
    return {
      errors: {
        kernel: 'Invalid format.',
      },
      disabledNext: true,
    };
  }

  if (kernel.append.length > 0) {
    const invalidArgs = [];

    for (const arg of kernel.append) {
      if (!isKernelArgumentValid(arg)) {
        invalidArgs.push(arg);
      }
    }

    if (invalidArgs.length > 0) {
      return {
        errors: { kernelAppend: `Invalid kernel arguments: ${invalidArgs}` },
        disabledNext: true,
      };
    }
  }

  return { errors: {}, disabledNext: false };
}

export function useFirewallValidation(): StepValidation {
  const firewall = useAppSelector(selectFirewall);
  const errors = {};
  const invalidPorts = [];
  const invalidDisabled = [];
  const invalidEnabled = [];

  if (firewall.ports.length > 0) {
    for (const port of firewall.ports) {
      if (!isPortValid(port)) {
        invalidPorts.push(port);
      }
    }

    if (invalidPorts.length > 0) {
      Object.assign(errors, { ports: `Invalid ports: ${invalidPorts}` });
    }
  }

  if (firewall.services.disabled.length > 0) {
    for (const s of firewall.services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }

    if (invalidDisabled.length > 0) {
      Object.assign(errors, {
        disabledServices: `Invalid disabled services: ${invalidDisabled}`,
      });
    }
  }

  if (firewall.services.enabled.length > 0) {
    for (const s of firewall.services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }

    if (invalidEnabled.length > 0) {
      Object.assign(errors, {
        enabledServices: `Invalid enabled services: ${invalidEnabled}`,
      });
    }
  }

  return {
    errors,
    disabledNext:
      invalidPorts.length > 0 ||
      invalidDisabled.length > 0 ||
      invalidEnabled.length > 0,
  };
}

export function useServicesValidation(): StepValidation {
  const services = useAppSelector(selectServices);
  const errors = {};
  const invalidDisabled = [];
  const invalidMasked = [];
  const invalidEnabled = [];

  if (services.disabled.length > 0) {
    for (const s of services.disabled) {
      if (!isServiceValid(s)) {
        invalidDisabled.push(s);
      }
    }

    if (invalidDisabled.length > 0) {
      Object.assign(errors, {
        disabledSystemdServices: `Invalid disabled services: ${invalidDisabled}`,
      });
    }
  }

  if (services.masked.length > 0) {
    for (const s of services.masked) {
      if (!isServiceValid(s)) {
        invalidMasked.push(s);
      }
    }

    if (invalidMasked.length > 0) {
      Object.assign(errors, {
        maskedSystemdServices: `Invalid masked services: ${invalidMasked}`,
      });
    }
  }

  if (services.enabled.length > 0) {
    for (const s of services.enabled) {
      if (!isServiceValid(s)) {
        invalidEnabled.push(s);
      }
    }

    if (invalidEnabled.length > 0) {
      Object.assign(errors, {
        enabledSystemdServices: `Invalid enabled services: ${invalidEnabled}`,
      });
    }
  }

  return {
    errors,
    disabledNext: invalidDisabled.length > 0 || invalidEnabled.length > 0,
  };
}

const getUserNameErrorMsg = (userName: string): string => {
  if (userName && !isUserNameValid(userName)) {
    return 'Invalid user name';
  }
  return '';
};

const getPasswordErrorMsg = (
  userPassword: string,
  environments: string[]
): string => {
  const DEFAULT_PASSWORD_ERROR_MESSAGE =
    'Password helps protect your account, we recommend a password of at least 6 characters.';
  const AZURE_PASSWORD_ERROR_MESSAGE =
    "A password for the target environment 'Azure' must be at least 6 characters long. Please enter a longer password.";
  const WEAK_PASSWORD_WARNING =
    'WARNING: This password seems weak, please use with caution or include at least 3 of the following: lowercase letter, uppercase letters, numbers, symbols';

  const passwordValidationResult = isPasswordValid(userPassword);
  const isAzureEnvironment = environments.includes('azure');

  if (isAzureEnvironment && !passwordValidationResult.isValid) {
    return AZURE_PASSWORD_ERROR_MESSAGE;
  }

  if (isAzureEnvironment && passwordValidationResult.strength === 'error') {
    return WEAK_PASSWORD_WARNING;
  }

  if (!passwordValidationResult.isValid) {
    return DEFAULT_PASSWORD_ERROR_MESSAGE;
  }

  return '';
};

const getSshKeyErrorMsg = (userSshKey: string): string => {
  if (userSshKey && !isSshKeyValid(userSshKey)) {
    return 'Invalid SSH key';
  }
  return '';
};

export function useUsersValidation(): StepValidation {
  const index = 0;
  const userNameSelector = selectUserNameByIndex(index);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPasswordByIndex(index);
  const userPassword = useAppSelector(userPasswordSelector);
  const userSshKeySelector = selectUserSshKeyByIndex(index);
  const userSshKey = useAppSelector(userSshKeySelector);
  const users = useAppSelector(selectUsers);
  const environments = useAppSelector(selectImageTypes);

  const userNameError = getUserNameErrorMsg(userName);
  const passError = getPasswordErrorMsg(userPassword, environments);
  const sshKeyError = getSshKeyErrorMsg(userSshKey);

  const { isUserNameValidValue, isSshKeyValidValue, isPasswordValidValue } =
    calculateValidationFlags(userName, userPassword, userSshKey, environments);

  const canProceed =
    // Case 1: there is no users
    users.length === 0 ||
    // Case 2: userName is valid and SshKey or Password is valid
    (isUserNameValidValue && (isSshKeyValidValue || isPasswordValidValue));

  return {
    errors: {
      userName: userNameError,
      userPassword: passError,
      userSshKey: sshKeyError,
    },
    disabledNext: !canProceed,
  };
}

const calculateValidationFlags = (
  userName: string,
  userPassword: string,
  userSshKey: string,
  environments: string[]
): ValidationFlags => {
  const isUserNameValidValue = !!userName && isUserNameValid(userName);
  const isSshKeyValidValue = !!userSshKey && isSshKeyValid(userSshKey);
  const isPasswordValidValue =
    !!userPassword &&
    (isPasswordValid(userPassword).isValid || !environments.includes('azure'));

  return { isUserNameValidValue, isSshKeyValidValue, isPasswordValidValue };
};

export function useDetailsValidation(): StepValidation {
  const name = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const blueprintId = useAppSelector(selectBlueprintId);

  const nameValid = isBlueprintNameValid(name);
  const descriptionValid = isBlueprintDescriptionValid(description);
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
  if (name && !nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (uniqueName === false) {
    nameError = 'Blueprint with this name already exists';
  } else if (!blueprintId && uniqueName === null) {
    // Hack to keep the error message from flickering in create mode
    return { errors: { name: '' }, disabledNext: false };
  }

  return {
    errors: {
      name: nameError,
      description: descriptionValid ? '' : 'Invalid description',
    },
    // if uniqueName is null, we are still waiting for the API response
    disabledNext: !!nameError || !descriptionValid || uniqueName !== true,
  };
}
