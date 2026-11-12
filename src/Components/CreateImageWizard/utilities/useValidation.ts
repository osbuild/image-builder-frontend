import { useState } from 'react';

import {
  UNIQUE_VALIDATION_DELAY,
  WIZARD_STEP_IDS,
  WizardStepId,
} from '@/constants';
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
  selectBlueprintDescription,
  selectBlueprintId,
  selectBlueprintMode,
  selectBlueprintName,
  selectCloudSlice,
  selectFilesystemSlice,
  selectHasPendingInputs,
  selectImageSource,
  selectImageTypes,
  selectIsImageMode,
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
  validateCloudSlice,
  validateFilesystemSlice,
  validateSystemSlice,
  validateUsersSlice,
} from '@/store/slices/wizard';
import useDebounce from '@/Utilities/useDebounce';

import {
  isBlueprintNameValid,
  isSnapshotValid,
  isValidUrl,
  validateMultipleCertificates,
  validateSatelliteCommand,
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

type BlueprintValidation = {
  isValid: boolean;
  firstErrorStepId: WizardStepId | null;
};

export function useBlueprintValidation(): BlueprintValidation {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const aap = useAAPValidation();
  const registration = useRegistrationValidation();
  const snapshot = useSnapshotValidation();
  const details = useDetailsValidation();
  const imagePull = useImagePullValidation();
  const targetEnvironments = useAppSelector(selectImageTypes);
  const isImageMode = useAppSelector(selectIsImageMode);
  const imageSource = useAppSelector(selectImageSource);
  const { restrictions } = useCustomizationRestrictions({
    selectedImageTypes: targetEnvironments,
  });

  const cloud = useAppSelector(selectCloudSlice);
  const { errors: cloudErrors } = validateCloudSlice(cloud);

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

  const hasPendingInputs = useAppSelector(selectHasPendingInputs);

  const baseSettingsInvalid =
    targetEnvironments.length === 0 ||
    (isImageMode && !imageSource) ||
    aap.disabledNext ||
    details.disabledNext ||
    details.isPending ||
    registration.disabledNext ||
    snapshot.disabledNext ||
    imagePull.disabledNext ||
    cloudErrors.length > 0 ||
    hasPendingInputs;

  const advancedSettingsInvalid =
    filesystemErrors.length > 0 ||
    systemErrors.length > 0 ||
    usersErrors.length > 0 ||
    hasPendingInputs;

  const isValid = !baseSettingsInvalid && !advancedSettingsInvalid;

  return {
    isValid,
    firstErrorStepId: !isValid
      ? baseSettingsInvalid
        ? WIZARD_STEP_IDS.BASE_SETTINGS
        : WIZARD_STEP_IDS.ADVANCED_SETTINGS
      : null,
  };
}

export function useIsBlueprintValid(): boolean {
  return useBlueprintValidation().isValid;
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

    if (caCertificate === '') {
      errors.certificate =
        'Valid certificate must be present if you are registering Satellite';
    }

    const commandValidation = validateSatelliteCommand(
      registrationCommand,
      currentTimeSeconds,
    );
    Object.assign(errors, commandValidation);

    if (commandValidation.expired) {
      return {
        errors,
        disabledNext: caCertificate === undefined,
      };
    }

    return {
      errors,
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
