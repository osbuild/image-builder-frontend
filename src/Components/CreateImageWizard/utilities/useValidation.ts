import { useState } from 'react';

import { jwtDecode } from 'jwt-decode';

import { UNIQUE_VALIDATION_DELAY } from '@/constants';
import {
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useGetImageExistsQuery,
  useGetRegistryAuthStatusQuery,
  useSecuritySummary,
} from '@/store/api/backend';
import { IMAGE_REGISTRY_HOST } from '@/store/api/backend/onprem/constants';
import { useCustomizationRestrictions } from '@/store/api/distributions/hooks';
import { useShowActivationKeyQuery } from '@/store/api/rhsm';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  selectAapCallbackUrl,
  selectAapHostConfigKey,
  selectAapTlsCertificateAuthority,
  selectAapTlsConfirmation,
  selectActivationKey,
  selectAwsAccountId,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectBlueprintDescription,
  selectBlueprintId,
  selectBlueprintMode,
  selectBlueprintName,
  selectFilesystemSlice,
  selectGcpAccountType,
  selectGcpEmail,
  selectImageSource,
  selectImageTypes,
  selectIsOfficialImage,
  selectIsoPayloadReference,
  selectOrgId,
  selectRegistrationType,
  selectSatelliteCaCertificate,
  selectSatelliteRegistrationCommand,
  selectSnapshotDate,
  selectSystem,
  selectTemplate,
  selectUseLatest,
  selectUsersSlice,
  validateFilesystemSlice,
  validateSystemSlice,
  validateUsersSlice,
} from '@/store/slices/wizard';
import useDebounce from '@/Utilities/useDebounce';

import {
  isAwsAccountIdValid,
  isAzureResourceGroupValid,
  isAzureSubscriptionIdValid,
  isAzureTenantGUIDValid,
  isBlueprintNameValid,
  isGcpDomainValid,
  isGcpEmailValid,
  isSnapshotValid,
  isValidUrl,
  validateMultipleCertificates,
} from '../validators';

export type StepValidation = {
  errors: {
    [key: string]: string;
  };
  disabledNext: boolean;
  // An async check has not answered yet. Kept separate from disabledNext so a
  // step can wait for the answer instead of treating it as a validation error.
  isPending?: boolean;
};

export function useIsBlueprintValid(): boolean {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const aap = useAAPValidation();
  const registration = useRegistrationValidation();
  const snapshot = useSnapshotValidation();
  const details = useDetailsValidation();
  const azureTarget = useAzureValidation();
  const gcpTarget = useGcpValidation();
  const awsTarget = useAwsValidation();
  const targetEnvironments = useAppSelector(selectImageTypes);
  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: targetEnvironments,
  });

  const filesystem = useAppSelector(selectFilesystemSlice);
  const { filesystem: requiredFilesystem } = useSecuritySummary();
  const { errors: filesystemErrors } = validateFilesystemSlice(
    filesystem,
    blueprintMode,
    requiredFilesystem,
    restrictions.filesystem.shouldHide,
  );

  const system = useAppSelector(selectSystem);
  const { errors: systemErrors } = validateSystemSlice(system);

  const usersSlice = useAppSelector(selectUsersSlice);
  const { errors: usersErrors } = validateUsersSlice(
    usersSlice,
    restrictions.users.shouldHide,
  );

  return (
    !aap.disabledNext &&
    !registration.disabledNext &&
    filesystemErrors.length === 0 &&
    !snapshot.disabledNext &&
    systemErrors.length === 0 &&
    !details.disabledNext &&
    !details.isPending &&
    usersErrors.length === 0 &&
    !azureTarget.disabledNext &&
    !gcpTarget.disabledNext &&
    !awsTarget.disabledNext
  );
}

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

  const { isError: isErrorKeyInfo } = useShowActivationKeyQuery(
    { name: activationKey! },
    {
      skip: !activationKey || isOnPremise,
    },
  );

  if (registrationType === 'register-later') {
    return { errors: {}, disabledNext: false };
  }

  if (isOnPremise && registrationType !== 'register-satellite') {
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
      errors: { activationKey: 'Missing activation key' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-satellite' &&
    activationKey &&
    isErrorKeyInfo &&
    !isOnPremise
  ) {
    return {
      errors: { activationKey: 'Invalid activation key' },
      disabledNext: true,
    };
  }

  if (registrationType === 'register-satellite') {
    const errors: Record<string, string> = {};
    const commandTrimmed =
      typeof registrationCommand === 'string' ? registrationCommand.trim() : '';

    if (caCertificate === '') {
      Object.assign(errors, {
        certificate:
          'Valid certificate must be present if you are registering Satellite',
      });
    }

    if (commandTrimmed === '') {
      Object.assign(errors, {
        command: 'No registration command for Satellite registration',
      });
    } else {
      const bearerJwtRegex = /Bearer\s+([\w-]+\.[\w-]+\.[\w-]+)/;
      const match = commandTrimmed.match(bearerJwtRegex);
      if (!match) {
        Object.assign(errors, { command: 'Invalid or missing token' });
      } else {
        try {
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
        } catch {
          Object.assign(errors, { command: 'Invalid or missing token' });
        }
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

  if (callbackUrl && callbackUrl.trim() !== '' && isValidUrl(callbackUrl)) {
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

export function useDetailsValidation(): StepValidation {
  const name = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const blueprintId = useAppSelector(selectBlueprintId);

  const nameValid = isBlueprintNameValid(name);

  // Already cached by the wizard, which fetches the same blueprint in edit mode
  const { data: savedBlueprint } = useGetBlueprintQuery(
    { id: blueprintId || '' },
    { skip: !blueprintId },
  );

  // A name that hasn't been edited cannot collide with anything, so skip the
  // lookup rather than spending a round trip to confirm it.
  const isUnchangedName = !!blueprintId && name === savedBlueprint?.name;
  const skipUniqueCheck = !name || !nameValid || isUnchangedName;

  // Debouncing the query argument rather than the request itself lets RTK Query
  // own the caching. Every call site of this hook then shares one cache entry
  // and one in-flight request, and a remount reads the cached answer instead of
  // restarting the check from scratch.
  const debouncedName = useDebounce(name, UNIQUE_VALIDATION_DELAY);

  const { data, isFetching, isError } = useGetBlueprintsQuery(
    { name: debouncedName },
    { skip: skipUniqueCheck || !debouncedName },
  );

  let isUniqueName: boolean | null;
  if (skipUniqueCheck || isError) {
    // A check we could not run is not evidence of a collision, so fail open
    // rather than block the user on it.
    isUniqueName = true;
  } else if (debouncedName !== name || isFetching || !data) {
    isUniqueName = null;
  } else {
    isUniqueName = data.meta.count === 0 || data.data[0]?.id === blueprintId;
  }

  let nameError = '';
  if (!name) {
    nameError = 'Blueprint name is required';
  } else if (!nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (isUniqueName === false) {
    nameError = 'Blueprint with this name already exists';
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
    disabledNext: !!nameError || !!descriptionError,
    // Reported separately from disabledNext: nothing is known to be wrong yet,
    // so the step should wait for the answer rather than report an error.
    isPending: isUniqueName === null,
  };
}

export function useAzureValidation(): StepValidation {
  const imageTypes = useAppSelector(selectImageTypes);
  const errors: Record<string, string> = {};

  const azureTenantId = useAppSelector(selectAzureTenantId);
  const azureSubscriptionId = useAppSelector(selectAzureSubscriptionId);
  const azureResourceGroup = useAppSelector(selectAzureResourceGroup);

  if (!imageTypes.includes('azure')) {
    return { errors, disabledNext: false };
  }

  if (!isAzureTenantGUIDValid(azureTenantId)) {
    errors.tenantId = 'Invalid tenant id';
  }

  if (!isAzureSubscriptionIdValid(azureSubscriptionId)) {
    errors.subscriptionId = 'Invalid subscription id';
  }

  if (!isAzureResourceGroupValid(azureResourceGroup)) {
    errors.resourceGroup = 'Invalid resource group';
  }

  return { errors, disabledNext: Object.keys(errors).length > 0 };
}

export function useGcpValidation(): StepValidation {
  const imageTypes = useAppSelector(selectImageTypes);
  const errors: Record<string, string> = {};

  const gcpAccountType = useAppSelector(selectGcpAccountType);
  const gcpEmail = useAppSelector(selectGcpEmail);

  if (!imageTypes.includes('gcp')) {
    return { errors, disabledNext: false };
  }

  if (gcpAccountType === 'domain') {
    if (!isGcpDomainValid(gcpEmail)) {
      errors.email = 'Invalid domain';
    }
  } else {
    if (!isGcpEmailValid(gcpEmail)) {
      errors.email = 'Invalid email';
    }
  }

  return { errors, disabledNext: Object.keys(errors).length > 0 };
}

export function useAwsValidation(): StepValidation {
  const imageTypes = useAppSelector(selectImageTypes);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const errors: Record<string, string> = {};

  const awsAccountId = useAppSelector(selectAwsAccountId);

  if (!imageTypes.includes('aws') || isOnPremise) {
    return { errors, disabledNext: false };
  }

  if (!isAwsAccountIdValid(awsAccountId)) {
    errors.accountId = 'Invalid account id';
  }

  return { errors, disabledNext: Object.keys(errors).length > 0 };
}

export const useImagePullValidation = (): StepValidation => {
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isOfficialImage = useAppSelector(selectIsOfficialImage);
  const imageSource = useAppSelector(selectImageSource);
  // Only set when the container installer is selected; the installer
  // needs its payload container in local storage too.
  const isoPayloadReference = useAppSelector(selectIsoPayloadReference);

  const { data: imageExists, isLoading } = useGetImageExistsQuery(
    { reference: imageSource! },
    { skip: !isOnPremise || !isOfficialImage },
  );
  const { data: payloadExists, isLoading: isPayloadLoading } =
    useGetImageExistsQuery(
      { reference: isoPayloadReference! },
      { skip: !isOnPremise || !isOfficialImage || !isoPayloadReference },
    );
  const { data: authStatus } = useGetRegistryAuthStatusQuery(undefined, {
    skip: !isOnPremise || !isOfficialImage,
  });
  const isAuthenticated = authStatus?.status === 'authenticated';

  if (!isOnPremise || !isOfficialImage) {
    return { errors: {}, disabledNext: false };
  }

  const needsPayload = !!isoPayloadReference;

  if (isLoading || (needsPayload && isPayloadLoading)) {
    return { errors: {}, disabledNext: true };
  }

  if (imageExists !== true) {
    return {
      errors: {
        imagePull: isAuthenticated
          ? 'Bootc container must be pulled before proceeding'
          : `Bootc container is not in local storage. Log in to ${IMAGE_REGISTRY_HOST} to pull it.`,
      },
      disabledNext: true,
    };
  }

  if (needsPayload && payloadExists !== true) {
    return {
      errors: {
        imagePull: isAuthenticated
          ? 'Payload container must be pulled before proceeding'
          : `Payload container is not in local storage. Log in to ${IMAGE_REGISTRY_HOST} to pull it.`,
      },
      disabledNext: true,
    };
  }

  return { errors: {}, disabledNext: false };
};
