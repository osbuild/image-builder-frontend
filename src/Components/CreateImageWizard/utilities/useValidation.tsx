import React, { useEffect, useState } from 'react';

import { CheckCircleIcon } from '@patternfly/react-icons';
import { jwtDecode, JwtPayload } from 'jwt-decode';

import { UNIQUE_VALIDATION_DELAY } from '../../../constants';
import { useLazyGetBlueprintsQuery } from '../../../store/backendApi';
import { useAppSelector } from '../../../store/hooks';
import { BlueprintsResponse } from '../../../store/imageBuilderApi';
import { useShowActivationKeyQuery } from '../../../store/rhsmApi';
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
  selectUsers,
  selectNtpServers,
  selectFirewall,
  selectServices,
  selectLanguages,
  selectKeyboard,
  selectTimezone,
  selectSatelliteRegistrationCommand,
  selectImageTypes,
  UserWithAdditionalInfo,
  selectTemplate,
} from '../../../store/wizardSlice';
import { keyboardsList } from '../steps/Locale/keyboardsList';
import { languagesList } from '../steps/Locale/languagesList';
import { HelperTextVariant } from '../steps/Packages/components/CustomHelperText';
import { timezones } from '../steps/Timezone/timezonesList';
import {
  getDuplicateMountPoints,
  isBlueprintNameValid,
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
  isUserGroupValid,
} from '../validators';

export type StepValidation = {
  errors: {
    [key: string]: string;
  };
  disabledNext: boolean;
};

export type UsersStepValidation = {
  errors: {
    [key: string]: { [key: string]: string };
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

type PasswordValidationResult = {
  isValid: boolean;
  strength: {
    variant: HelperTextVariant;
    icon: JSX.Element | null;
    text: string;
  };
  validationState: ValidationState;
};

type ValidationState = {
  ruleLength: HelperTextVariant;
  ruleCharacters: HelperTextVariant;
};

function tokenValidityRemaining(expireTimeInSeconds: number): number {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  return expireTimeInSeconds - currentTimeSeconds;
}

function decodeToken(token: string): JwtPayload | undefined {
  try {
    const decoded = jwtDecode(token) as { exp?: number };
    return decoded;
  } catch {
    return undefined;
  }
}

function getExpirationString(totalSeconds: number): string | undefined {
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 25) {
    return undefined;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return 'less than an hour';
}

export function validateSatelliteToken(
  registrationCommand: string | undefined
) {
  const errors: Record<string, string> = {};
  if (registrationCommand === '') {
    errors.command = 'No registration command for Satellite registration';
    return errors;
  }

  const match = registrationCommand?.match(/Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)/);
  if (!match || match.length < 2) {
    errors.command = 'Invalid or missing token';
    return errors;
  }
  const satelliteToken = decodeToken(match[1]);
  if (satelliteToken === undefined) {
    errors.command = 'Invalid or missing token';
    return errors;
  }

  if (satelliteToken.exp) {
    const tokenRemainingS = tokenValidityRemaining(satelliteToken.exp);
    if (tokenRemainingS <= 0) {
      errors.command = `The token is expired. Check out the Satellite documentation to extend the token lifetime.`;
      return errors;
    }
    const expirationString = getExpirationString(tokenRemainingS);
    if (expirationString !== undefined) {
      errors.expired = `The token expires in ${expirationString}. Check out the Satellite documentation to extend the token lifetime.`;
    }
  }

  return errors;
}

export function useRegistrationValidation(): StepValidation {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);
  const registrationCommand = useAppSelector(
    selectSatelliteRegistrationCommand
  );

  const { isFetching: isFetchingKeyInfo, isError: isErrorKeyInfo } =
    useShowActivationKeyQuery(
      { name: activationKey! },
      {
        skip: !activationKey,
      }
    );

  if (
    registrationType !== 'register-later' &&
    registrationType !== 'register-satellite' &&
    !activationKey
  ) {
    return {
      errors: { activationKey: 'No activation key selected' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-later' &&
    registrationType !== 'register-satellite' &&
    activationKey &&
    (isFetchingKeyInfo || isErrorKeyInfo)
  ) {
    return {
      errors: { activationKey: 'Invalid activation key' },
      disabledNext: true,
    };
  }

  if (registrationType === 'register-satellite') {
    const errors = {};
    const tokenErrors = validateSatelliteToken(registrationCommand);
    Object.assign(errors, tokenErrors);

    return {
      errors: errors,
      disabledNext:
        Object.keys(errors).some((key) => key !== 'expired') ||
        !registrationCommand,
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
    if (partition.min_size === '') {
      errors[`min-size-${partition.id}`] = 'Partition size is required';
      disabledNext = true;
    } else if (!isMountpointMinSizeValid(partition.min_size)) {
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
  const template = useAppSelector(selectTemplate);

  if (!useLatest && !isSnapshotValid(snapshotDate) && template === '') {
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

  const hostnameError =
    hostname && !isHostnameValid(hostname) ? errorMessage : '';

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

  const kernelNameError =
    kernel.name && !isKernelNameValid(kernel.name) ? 'Invalid format.' : '';

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

const validateUserName = (
  users: UserWithAdditionalInfo[],
  userName: string,
  currentIndex: number
): string => {
  if (!userName) {
    return 'Required value';
  }
  if (!isUserNameValid(userName)) {
    return 'Invalid user name';
  }

  // check for duplicate names
  const count = users.filter(
    (user, index) => user.name === userName && index !== currentIndex
  ).length;
  if (count > 0) {
    return 'Username already exists';
  }
  return '';
};

const validateSshKey = (userSshKey: string): string => {
  if (userSshKey && !isSshKeyValid(userSshKey)) {
    return 'Invalid SSH key';
  }
  return '';
};

export function useUsersValidation(): UsersStepValidation {
  const environments = useAppSelector(selectImageTypes);
  const users = useAppSelector(selectUsers);
  const errors: { [key: string]: { [key: string]: string } } = {};

  if (users.length === 0) {
    return {
      errors: {},
      disabledNext: false,
    };
  }

  for (let index = 0; index < users.length; index++) {
    const invalidGroups = [];
    const userNameError = validateUserName(users, users[index].name, index);
    const sshKeyError = validateSshKey(users[index].ssh_key);
    const isPasswordValid = checkPasswordValidity(
      users[index].password,
      environments.includes('azure')
    ).isValid;
    const passwordError =
      users[index].password && !isPasswordValid ? 'Invalid password' : '';

    if (users[index].groups.length > 0) {
      for (const g of users[index].groups) {
        if (!isUserGroupValid(g)) {
          invalidGroups.push(g);
        }
      }
    }

    const groupsError =
      invalidGroups.length > 0 ? `Invalid user groups: ${invalidGroups}` : '';

    if (
      userNameError ||
      sshKeyError ||
      (users[index].password && !isPasswordValid) ||
      groupsError
    ) {
      errors[`${index}`] = {
        userName: userNameError,
        userSshKey: sshKeyError,
        userPassword: passwordError,
        groups: groupsError,
      };
    }
  }

  const canProceed =
    // Case 1: there is no users
    users.length === 0 ||
    // Case 2: all users are valid
    Object.keys(errors).length === 0;

  return {
    errors,
    disabledNext: !canProceed,
  };
}

export const checkPasswordValidity = (
  password: string,
  isAzure: boolean
): PasswordValidationResult => {
  if (!password) {
    return {
      isValid: false,
      strength: getStrength(0, 0, false),
      validationState: {
        ruleLength: 'indeterminate',
        ruleCharacters: 'indeterminate',
      },
    };
  }
  const isEncrypted = /^\$([^$]+)\$/.test(password);
  if (isEncrypted) {
    return {
      isValid: true,
      strength: getStrength(0, 0, false),
      validationState: {
        ruleLength: 'success',
        ruleCharacters: 'success',
      },
    };
  }

  const trimmedValue = password.trim();
  const isLengthValid = trimmedValue.length >= 6 && trimmedValue.length <= 128;
  const { rulesCount, strCount } = countCharacterTypes(password);

  const validationState: ValidationState = {
    ruleLength: isLengthValid ? 'success' : 'error',
    ruleCharacters: rulesCount >= 3 ? 'success' : 'error',
  };

  return {
    isValid: isLengthValid,
    strength: getStrength(strCount, rulesCount, isAzure),
    validationState: validationState,
  };
};

const getStrength = (
  strCount: number,
  rulesCount: number,
  isAzure: boolean
): PasswordValidationResult['strength'] => {
  return isAzure && strCount >= 6 && rulesCount >= 3
    ? { variant: 'success', icon: <CheckCircleIcon />, text: 'Strong' }
    : { variant: 'default', icon: null, text: '' };
};

const countCharacterTypes = (value: string) => {
  const lowercaseCount = (value.match(/[a-z]/g) || []).length;
  const uppercaseCount = (value.match(/[A-Z]/g) || []).length;
  const digitsCount = (value.match(/\d/g) || []).length;
  const specialCount = (value.match(/\W/g) || []).length;

  const rulesCount = [
    lowercaseCount,
    uppercaseCount,
    digitsCount,
    specialCount,
  ].filter((count) => count > 0).length;
  const strCount = lowercaseCount + uppercaseCount + digitsCount + specialCount;

  return { rulesCount, strCount };
};

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

  let descriptionError = '';
  const maxDescriptionLength = 250;
  if (description.length > maxDescriptionLength) {
    descriptionError = `Description is too long (max ${maxDescriptionLength} characters)`;
  }

  return {
    errors: {
      name: nameError,
      description: descriptionError,
    },
    // if uniqueName is null, we are still waiting for the API response
    disabledNext: !!nameError || !!descriptionError || uniqueName !== true,
  };
}
