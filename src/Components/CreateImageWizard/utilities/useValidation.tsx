import React, { useEffect, useState } from 'react';

import { CheckCircleIcon } from '@patternfly/react-icons';
import { jwtDecode } from 'jwt-decode';

import { getListOfDuplicates } from './getListOfDuplicates';

import {
  SYSTEM_GROUPS,
  UNDEFINED_GROUPS_WARNING_KEY,
  UNIQUE_VALIDATION_DELAY,
} from '../../../constants';
import { useLazyGetBlueprintsQuery } from '../../../store/backendApi';
import { selectIsOnPremise } from '../../../store/envSlice';
import { useAppSelector } from '../../../store/hooks';
import { BlueprintsResponse } from '../../../store/imageBuilderApi';
import { useShowActivationKeyQuery } from '../../../store/rhsmApi';
import {
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
  selectActivationKey,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectBlueprintDescription,
  selectBlueprintId,
  selectBlueprintMode,
  selectBlueprintName,
  selectDiskPartitions,
  selectFilesystemPartitions,
  selectFirewall,
  selectFirstBootScript,
  selectFscMode,
  selectHostname,
  selectImageTypes,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectNtpServers,
  selectOrgId,
  selectRegistrationType,
  selectSatelliteCaCertificate,
  selectSatelliteRegistrationCommand,
  selectServices,
  selectSnapshotDate,
  selectTemplate,
  selectTimezone,
  selectUseLatest,
  selectUserGroups,
  selectUsers,
  UserWithAdditionalInfo,
} from '../../../store/wizardSlice';
import { keyboardsList } from '../steps/Locale/keyboardsList';
import { languagesList } from '../steps/Locale/languagesList';
import { HelperTextVariant } from '../steps/Packages/components/CustomHelperText';
import { timezones } from '../steps/Timezone/timezonesList';
import {
  getDuplicateMountPoints,
  getDuplicateNames,
  getInvalidMountpoints,
  isAzureResourceGroupValid,
  isAzureSubscriptionIdValid,
  isAzureTenantGUIDValid,
  isBlueprintNameValid,
  isHostnameValid,
  isKernelArgumentValid,
  isKernelNameValid,
  isMountpointMinSizeValid,
  isMountpointValid,
  isNtpServerValid,
  isPartitionNameValid,
  isPortValid,
  isServiceValid,
  isSnapshotValid,
  isSshKeyValid,
  isUserGroupValid,
  isUserNameValid,
  isValidUrl,
  validateMultipleCertificates,
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
  const userGroups = useUserGroupsValidation();
  const azureTarget = useAzureValidation();
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
    !users.disabledNext &&
    !userGroups.disabledNext &&
    !azureTarget.disabledNext
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

export function useRegistrationValidation(): StepValidation {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);
  const orgId = useAppSelector(selectOrgId);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const registrationCommand = useAppSelector(
    selectSatelliteRegistrationCommand,
  );
  const caCertificate = useAppSelector(selectSatelliteCaCertificate);
  const [currentTimeSeconds] = useState(() => Date.now() / 1000);

  const { isFetching: isFetchingKeyInfo, isError: isErrorKeyInfo } =
    useShowActivationKeyQuery(
      { name: activationKey! },
      {
        skip: !activationKey || isOnPremise,
      },
    );

  if (registrationType === 'register-later') {
    return { errors: {}, disabledNext: false };
  }

  if (isOnPremise) {
    const errors: Record<string, string> = {};
    let disabledNext = false;

    if (!activationKey?.trim()) {
      errors.activationKey = 'Activation Key not set';
      disabledNext = true;
    }

    if (!orgId?.trim()) {
      errors.orgId = 'Organization ID not set';
      disabledNext = true;
    } else if (!/^\d+$/.test(orgId.trim())) {
      errors.orgId = 'Organization ID should be a numeric value';
      disabledNext = true;
    }

    if (Object.keys(errors).length > 0) {
      return { errors, disabledNext };
    }
  }

  if (registrationType !== 'register-satellite' && !activationKey) {
    return {
      errors: { activationKey: 'No activation key selected' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-satellite' &&
    activationKey &&
    (isFetchingKeyInfo || isErrorKeyInfo) &&
    !isOnPremise
  ) {
    return {
      errors: { activationKey: 'Invalid activation key' },
      disabledNext: true,
    };
  }

  if (registrationType === 'register-satellite') {
    const errors = {};

    if (caCertificate === '') {
      Object.assign(errors, {
        certificate:
          'Valid certificate must be present if you are registering Satellite',
      });
    }

    if (registrationCommand === '' || !registrationCommand) {
      Object.assign(errors, {
        command: 'No registration command for Satellite registration',
      });
    }

    if (registrationCommand) {
      try {
        const match = registrationCommand.match(
          /Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)/,
        );
        if (!match) {
          Object.assign(errors, { command: 'Invalid or missing token' });
        } else {
          const token = match[1];
          const decoded = jwtDecode(token);
          if (decoded.exp) {
            const dayInSeconds = 86400;
            if (decoded.exp < currentTimeSeconds + dayInSeconds) {
              const expirationDate = new Date(decoded.exp * 1000);
              Object.assign(errors, {
                expired:
                  'The token is already expired or will expire by next day. Expiration date: ' +
                  expirationDate,
              });
              return {
                errors: errors,
                disabledNext: caCertificate === undefined,
              };
            }
          }
        }
      } catch {
        Object.assign(errors, { command: 'Invalid or missing token' });
      }
    }

    return {
      errors: errors,
      disabledNext:
        Object.keys(errors).length > 0 || caCertificate === undefined,
    };
  }

  return { errors: {}, disabledNext: false };
}

export function useAAPValidation(): StepValidation {
  const errors: Record<string, string> = {};
  const callbackUrl = useAppSelector(selectAapCallbackUrl);
  const hostConfigKey = useAppSelector(selectAapHostConfigKey);
  const tlsCertificateAuthority = useAppSelector(
    selectAapTlsCertificateAuthority,
  );
  const tlsConfirmation = useAppSelector(selectAapTlsConfirmation);

  if (!callbackUrl && !hostConfigKey && !tlsCertificateAuthority) {
    return { errors: {}, disabledNext: false };
  }
  if (!callbackUrl || callbackUrl.trim() === '') {
    errors.callbackUrl = 'Ansible Callback URL is required';
  } else if (!isValidUrl(callbackUrl)) {
    errors.callbackUrl = 'Callback URL must be a valid URL';
  }

  if (!hostConfigKey || hostConfigKey.trim() === '') {
    errors.hostConfigKey = 'Host Config Key is required';
  }

  if (tlsCertificateAuthority && tlsCertificateAuthority.trim() !== '') {
    const validation = validateMultipleCertificates(tlsCertificateAuthority);
    if (validation.errors.length > 0) {
      errors.certificate = validation.errors.join(' ');
    } else if (validation.validCertificates.length === 0) {
      errors.certificate = 'No valid certificates found in the input.';
    }
  }

  if (callbackUrl && callbackUrl.trim() !== '') {
    const isHttpsUrl = callbackUrl.toLowerCase().startsWith('https://');

    // If URL is HTTP, require TLS certificate
    if (
      !isHttpsUrl &&
      (!tlsCertificateAuthority || tlsCertificateAuthority.trim() === '')
    ) {
      errors.certificate = 'HTTP URL requires a custom TLS certificate';
      return { errors, disabledNext: true };
    }

    // For HTTPS URL, if the TLS confirmation is not checked, require certificate
    if (
      !tlsConfirmation &&
      (!tlsCertificateAuthority || tlsCertificateAuthority.trim() === '')
    ) {
      errors.certificate =
        'HTTPS URL requires either a custom TLS certificate or confirmation that no custom certificate is needed';
    }
  }

  return { errors, disabledNext: Object.keys(errors).length > 0 };
}

export function useFilesystemValidation(): StepValidation {
  const fscMode = useAppSelector(selectFscMode);
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);
  const diskPartitions = useAppSelector(selectDiskPartitions);
  const blueprintMode = useAppSelector(selectBlueprintMode);
  let disabledNext = false;

  const errors: { [key: string]: string } = {};
  if (fscMode === 'automatic') {
    return { errors, disabledNext: false };
  }

  const fscMountpointDuplicates = getDuplicateMountPoints(filesystemPartitions);
  for (const partition of filesystemPartitions) {
    if (!partition.min_size || partition.min_size === '') {
      errors[`min-size-${partition.id}`] = 'Partition size is required';
      disabledNext = true;
    }
    if (partition.min_size && !isMountpointMinSizeValid(partition.min_size)) {
      errors[`min-size-${partition.id}`] = 'Must be larger than 0';
      disabledNext = true;
    }
    if (fscMountpointDuplicates.includes(partition.mountpoint)) {
      errors[`mountpoint-${partition.id}`] = 'Duplicate mount points';
      disabledNext = true;
    }
    if (!isMountpointValid(partition, blueprintMode)) {
      errors[`mountpoint-subpath-${partition.id}`] = 'Invalid mountpoint';
      disabledNext = true;
    }
  }

  const volumeGroups = diskPartitions.filter((p) => p.type === 'lvm');
  const diskMountpointDuplicates = getDuplicateMountPoints(diskPartitions);
  const diskInvalidMountpoints = getInvalidMountpoints(
    diskPartitions,
    blueprintMode,
  );
  const diskNameDuplicates = volumeGroups.flatMap((vg) =>
    getDuplicateNames(vg),
  );
  for (const partition of diskPartitions) {
    if (!partition.min_size || partition.min_size === '') {
      errors[`min-size-${partition.id}`] = 'Partition size is required';
      disabledNext = true;
    }
    if (partition.min_size && !isMountpointMinSizeValid(partition.min_size)) {
      errors[`min-size-${partition.id}`] = 'Must be larger than 0';
      disabledNext = true;
    }
    if ('mountpoint' in partition) {
      if (!partition.mountpoint) {
        errors[`mountpoint-${partition.id}`] = 'Undefined mount point';
        disabledNext = true;
      }
      if (partition.mountpoint) {
        if (diskMountpointDuplicates.includes(partition.mountpoint)) {
          errors[`mountpoint-${partition.id}`] = 'Duplicate mount points';
          disabledNext = true;
        }
        if (diskInvalidMountpoints.includes(partition.mountpoint)) {
          errors[`mountpoint-${partition.id}`] = 'Invalid mount point';
          disabledNext = true;
        }
      }
    }
  }

  for (const partition of diskPartitions) {
    if (
      'name' in partition &&
      partition.name &&
      !isPartitionNameValid(partition.name)
    ) {
      errors[`name-${partition.id}`] = 'Partition name is invalid';
      disabledNext = true;
    }
    if (
      'name' in partition &&
      partition.name &&
      diskNameDuplicates.includes(partition.name)
    ) {
      errors[`name-${partition.id}`] = 'Name is not unique';
      disabledNext = true;
    }

    if (partition.type === 'lvm' && partition.logical_volumes.length > 0) {
      for (const lv of partition.logical_volumes) {
        if (lv.name && !isPartitionNameValid(lv.name)) {
          errors[`name-${lv.id}`] = 'Volume name is invalid';
          disabledNext = true;
        }
        if (lv.name && diskNameDuplicates.includes(lv.name)) {
          errors[`name-${lv.id}`] = 'Name is not unique';
          disabledNext = true;
        }
        if (!lv.min_size || lv.min_size === '') {
          errors[`min-size-${lv.id}`] = 'Partition size is required';
          disabledNext = true;
        }
        if (lv.min_size && !isMountpointMinSizeValid(lv.min_size)) {
          errors[`min-size-${lv.id}`] = 'Must be larger than 0';
          disabledNext = true;
        }
        if ('mountpoint' in lv) {
          if (!lv.mountpoint && lv.fs_type !== 'swap') {
            errors[`mountpoint-${lv.id}`] = 'Undefined mount point';
            disabledNext = true;
          }
          if (lv.mountpoint) {
            if (diskMountpointDuplicates.includes(lv.mountpoint)) {
              errors[`mountpoint-${lv.id}`] = 'Duplicate mount points';
              disabledNext = true;
            }
            if (diskInvalidMountpoints.includes(lv.mountpoint)) {
              errors[`mountpoint-${lv.id}`] = 'Invalid mount point';
              disabledNext = true;
            }
          }
        }
      }
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

  const duplicateNtpServers = getListOfDuplicates(ntpServers || []);

  const timezoneError =
    timezone && !timezones.includes(timezone) ? 'Unknown timezone' : '';
  const ntpServersError =
    invalidServers.length > 0 ? `Invalid NTP servers: ${invalidServers}` : '';
  const duplicateNtpServersError =
    duplicateNtpServers.length > 0
      ? `Includes duplicate NTP servers: ${duplicateNtpServers.join(', ')}`
      : '';

  return {
    errors: {
      timezone: timezoneError,
      ntpServers: ntpServersError + '|' + duplicateNtpServersError,
    },
    disabledNext:
      timezoneError !== '' ||
      invalidServers.length > 0 ||
      duplicateNtpServers.length > 0,
  };
}

export function useLocaleValidation(): StepValidation {
  const languagesSet: Set<string> = new Set();
  const duplicates: string[] = [];
  const languages = useAppSelector(selectLanguages);
  const keyboard = useAppSelector(selectKeyboard);

  const errors = {};
  const unknownLanguages = [];

  if (languages && languages.length > 0) {
    for (const lang of languages) {
      if (!languagesList.includes(lang)) {
        unknownLanguages.push(lang);
      }
      if (languagesSet.has(lang)) {
        duplicates.push(lang);
      } else {
        languagesSet.add(lang);
      }
    }
  }

  const languagesError =
    unknownLanguages.length > 0 ? unknownLanguages.join(' ') : '';
  const duplicateLanguages = duplicates.length > 0 ? duplicates.join(' ') : '';
  const keyboardError =
    keyboard && !keyboardsList.includes(keyboard) ? 'Unknown keyboard' : '';

  return {
    errors: {
      unknownLanguages: languagesError,
      duplicateLanguages: duplicateLanguages,
      keyboard: keyboardError,
    },
    disabledNext:
      unknownLanguages.length > 0 ||
      duplicateLanguages.length > 0 ||
      'keyboard' in errors,
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

  const duplicateKernelArgs = getListOfDuplicates(kernel.append);

  const kernelNameError =
    kernel.name && !isKernelNameValid(kernel.name) ? 'Invalid format.' : '';

  const kernelAppendError =
    invalidArgs.length > 0 ? `Invalid kernel arguments: ${invalidArgs}` : '';

  const duplicateKernelArgsError =
    duplicateKernelArgs.length > 0
      ? `Includes duplicate kernel arguments: ${duplicateKernelArgs.join(', ')}`
      : '';

  return {
    errors: {
      kernel: kernelNameError,
      kernelAppend: kernelAppendError + '|' + duplicateKernelArgsError,
    },
    disabledNext:
      kernelNameError !== '' ||
      kernelAppendError !== '' ||
      duplicateKernelArgs.length > 0,
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

  const duplicatePorts = getListOfDuplicates(firewall.ports);
  const duplicateDisabledServices = getListOfDuplicates(
    firewall.services.disabled,
  );
  const duplicateEnabledServices = getListOfDuplicates(
    firewall.services.enabled,
  );

  const portsError =
    invalidPorts.length > 0 ? `Invalid ports: ${invalidPorts}` : '';
  const duplicatePortsError =
    duplicatePorts.length > 0
      ? `Includes duplicate ports: ${duplicatePorts.join(', ')}`
      : '';
  const duplicateDisabledServicesError =
    duplicateDisabledServices.length > 0
      ? `Includes duplicate disabled services: ${duplicateDisabledServices.join(
          ', ',
        )}`
      : '';
  const duplicateEnabledServicesError =
    duplicateEnabledServices.length > 0
      ? `Includes duplicate enabled services: ${duplicateEnabledServices.join(
          ', ',
        )}`
      : '';
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
      ports: portsError + '|' + duplicatePortsError,
      disabledServices:
        disabledServicesError + '|' + duplicateDisabledServicesError,
      enabledServices:
        enabledServicesError + '|' + duplicateEnabledServicesError,
    },
    disabledNext:
      invalidPorts.length > 0 ||
      invalidDisabled.length > 0 ||
      invalidEnabled.length > 0 ||
      duplicatePorts.length > 0 ||
      duplicateDisabledServices.length > 0 ||
      duplicateEnabledServices.length > 0,
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

  const duplicateDisabledServices = getListOfDuplicates(services.disabled);
  const duplicateMaskedServices = getListOfDuplicates(services.masked);
  const duplicateEnabledServices = getListOfDuplicates(services.enabled);

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
  const duplicateDisabledServicesError =
    duplicateDisabledServices.length > 0
      ? `Includes duplicate disabled services: ${duplicateDisabledServices.join(
          ', ',
        )}`
      : '';
  const duplicateMaskedServicesError =
    duplicateMaskedServices.length > 0
      ? `Includes duplicate masked services: ${duplicateMaskedServices.join(
          ', ',
        )}`
      : '';
  const duplicateEnabledServicesError =
    duplicateEnabledServices.length > 0
      ? `Includes duplicate enabled services: ${duplicateEnabledServices.join(
          ', ',
        )}`
      : '';

  return {
    errors: {
      disabledSystemdServices:
        disabledSystemdServicesError + '|' + duplicateDisabledServicesError,
      maskedSystemdServices:
        maskedSystemdServicesError + '|' + duplicateMaskedServicesError,
      enabledSystemdServices:
        enabledSystemdServicesError + '|' + duplicateEnabledServicesError,
    },
    disabledNext:
      invalidDisabled.length > 0 ||
      invalidMasked.length > 0 ||
      invalidEnabled.length > 0 ||
      duplicateDisabledServices.length > 0 ||
      duplicateMaskedServices.length > 0 ||
      duplicateEnabledServices.length > 0,
  };
}

const validateUserName = (
  users: UserWithAdditionalInfo[],
  userName: string,
  currentIndex: number,
): string => {
  if (!userName) {
    return 'Required value';
  }
  if (!isUserNameValid(userName)) {
    return 'Invalid user name';
  }

  // check for duplicate names
  const count = users.filter(
    (user, index) => user.name === userName && index !== currentIndex,
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
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const users = useAppSelector(selectUsers);
  const userGroups = useAppSelector(selectUserGroups);
  const errors: { [key: string]: { [key: string]: string } } = {};

  if (
    users.length === 0 ||
    (users.length === 1 && (users[0].name || '').trim() === '')
  ) {
    if (blueprintMode === 'image') {
      return {
        // the User step is required in image mode
        // blocking Next without a render error is sufficient
        errors: {},
        disabledNext: true,
      };
    }

    return {
      errors: {},
      disabledNext: false,
    };
  }

  const definedGroupNames = userGroups.map((group) => group.name);

  for (let index = 0; index < users.length; index++) {
    const userErrors: { [key: string]: string } = {};
    const isUserDefined =
      !!users[index].password ||
      !!users[index].ssh_key ||
      users[index].groups.length > 0;
    if (users[index].name || isUserDefined) {
      const userNameError = validateUserName(users, users[index].name, index);
      if (userNameError) {
        userErrors.userName = userNameError;
      }

      if (
        users[index].name &&
        userGroups.find((group) => group.name === users[index].name)
      ) {
        userErrors.userName = 'Username cannot match an existing group name';
      }
    }

    const isPasswordValid = checkPasswordValidity(
      users[index].password,
      environments.includes('azure'),
    ).isValid;
    if (users[index].password && !isPasswordValid) {
      userErrors.userPassword = 'Invalid password';
    }

    const sshKeyError = validateSshKey(users[index].ssh_key);
    if (sshKeyError) {
      userErrors.userSshKey = sshKeyError;
    }

    const invalidGroups = [];
    if (users[index].groups.length > 0) {
      for (const g of users[index].groups) {
        if (!isUserGroupValid(g)) {
          invalidGroups.push(g);
        }
      }
    }

    const duplicateGroups = getListOfDuplicates(users[index].groups);
    const groupMatchingUsername =
      users[index].name && users[index].groups.includes(users[index].name)
        ? users[index].name
        : '';

    const undefinedGroups = users[index].groups.filter(
      (groupName) =>
        !definedGroupNames.includes(groupName) &&
        !SYSTEM_GROUPS.includes(groupName) &&
        isUserGroupValid(groupName),
    );
    if (
      invalidGroups.length > 0 ||
      duplicateGroups.length > 0 ||
      groupMatchingUsername
    ) {
      const groupsErrors = [];
      if (invalidGroups.length > 0) {
        groupsErrors.push(`Invalid user groups: ${invalidGroups.join(', ')}`);
      }
      if (duplicateGroups.length > 0) {
        groupsErrors.push(
          `Includes duplicate groups: ${duplicateGroups.join(', ')}`,
        );
      }
      if (groupMatchingUsername) {
        groupsErrors.push(
          `Group cannot match username: ${groupMatchingUsername}`,
        );
      }
      userErrors.groups = groupsErrors.join(' | ');
    }

    if (undefinedGroups.length > 0) {
      userErrors[UNDEFINED_GROUPS_WARNING_KEY] =
        `User assigned to undefined group(s): ${undefinedGroups.join(', ')}. Ensure these groups exist on the system or define them in the 'Groups' section.`;
    }

    if (Object.keys(userErrors).length > 0) {
      errors[index] = userErrors;
    }
  }

  // Count only blocking errors (exclude warnings)
  const hasBlockingErrors = Object.values(errors).some((userErrors) => {
    return Object.keys(userErrors).some(
      (key) => key !== UNDEFINED_GROUPS_WARNING_KEY,
    );
  });

  const canProceed =
    // Case 1: there is no users
    users.length === 0 ||
    // Case 2: all users are valid (no blocking errors)
    !hasBlockingErrors;

  return {
    errors,
    disabledNext: !canProceed,
  };
}

export function useUserGroupsValidation(): UsersStepValidation {
  const userGroups = useAppSelector(selectUserGroups);
  const errors: { [key: string]: { [key: string]: string } } = {};

  for (let index = 0; index < userGroups.length; index++) {
    const groupErrors: { [key: string]: string } = {};
    const group = userGroups[index];

    if (group.name) {
      if (!isUserGroupValid(group.name)) {
        groupErrors.groupName = 'Invalid group name';
      } else {
        const duplicates = userGroups.filter(
          (g, idx) => idx !== index && g.name === group.name,
        );
        if (duplicates.length > 0) {
          groupErrors.groupName = 'Group name must be unique';
        }
      }
    }

    if (Object.keys(groupErrors).length > 0) {
      errors[index] = groupErrors;
    }
  }

  // All groups are either empty or valid (no errors)
  const canProceed = Object.keys(errors).length === 0;

  return {
    errors,
    disabledNext: !canProceed,
  };
}

export const checkPasswordValidity = (
  password: string,
  isAzure: boolean,
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
  isAzure: boolean,
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
                response.meta.count > 0 &&
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
        UNIQUE_VALIDATION_DELAY, // If name is empty string, instantly return
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

export function useAzureValidation(): StepValidation {
  const errors: Record<string, string> = {};
  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);

  if (!isAzureTenantGUIDValid(azureTenantId)) {
    errors.tenandId = 'Invalid tenant id';
  }

  if (!isAzureSubscriptionIdValid(azureSubscriptionId)) {
    errors.subscriptionId = 'Invalid subscription id';
  }

  if (!isAzureResourceGroupValid(azureResourceGroup)) {
    errors.resourceGroup = 'Invalid resource group';
  }

  return { errors, disabledNext: Object.keys(errors).length > 0 };
}
