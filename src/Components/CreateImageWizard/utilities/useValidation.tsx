import { useEffect, useState } from 'react';

import { UNIQUE_VALIDATION_DELAY } from '../../../constants';
import { useAppSelector } from '../../../store/hooks';
import {
  BlueprintsResponse,
  useLazyGetBlueprintsQuery,
} from '../../../store/imageBuilderApi';
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
  selectUserName,
  selectUserPassword,
  selectConfirmUserPassword,
  selectUserSshKey,
  selectUsers,
} from '../../../store/wizardSlice';
import {
  getDuplicateMountPoints,
  isBlueprintNameValid,
  isBlueprintDescriptionValid,
  isMountpointMinSizeValid,
  isSnapshotValid,
  isHostnameValid,
  isPasswordValid,
  isUserNameValid,
  isConfirmPasswordValid,
  isSshKeyValid,
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
  const hostname = useHostnameValidation();
  const firstBoot = useFirstBootValidation();
  const details = useDetailsValidation();
  const users = useUserValidation();
  return (
    !registration.disabledNext &&
    !filesystem.disabledNext &&
    !snapshot.disabledNext &&
    !hostname.disabledNext &&
    !firstBoot.disabledNext &&
    !details.disabledNext &&
    !users.disabledNext
  );
}

export function useRegistrationValidation(): StepValidation {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);

  const { isFetching, isError } = useShowActivationKeyQuery(
    { name: activationKey! },
    {
      skip: !activationKey,
    }
  );

  if (registrationType !== 'register-later' && !activationKey) {
    return {
      errors: { activationKey: 'No activation key selected' },
      disabledNext: true,
    };
  }

  if (
    registrationType !== 'register-later' &&
    activationKey &&
    (isFetching || isError)
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

export function useUserValidation(): StepValidation {
  const userNameSelector = selectUserName(0);
  const users = useAppSelector(selectUsers);
  const userName = useAppSelector(userNameSelector);
  const userPasswordSelector = selectUserPassword(0);
  const userPassword = useAppSelector(userPasswordSelector);
  const userConfirmPasswordSelector = selectConfirmUserPassword(0);
  const userConfirmPassword = useAppSelector(userConfirmPasswordSelector);
  const userSshKeySelector = selectUserSshKey(0);
  const userSshKey = useAppSelector(userSshKeySelector);
  const userNameValid = isUserNameValid(userName || '');
  const passwordValid = isPasswordValid(userPassword || '');

  const passwordConfirmMatchValid = isConfirmPasswordValid(
    userPassword || '',
    userConfirmPassword || ''
  );
  const sshKeyValid = isSshKeyValid(userSshKey || '');
  const isPasswordAndConfirmValid = passwordValid && passwordConfirmMatchValid;
  const canProceed =
    users.length === 0 ||
    (userConfirmPassword === '' &&
      userSshKey === '' &&
      userPassword === '' &&
      userName === '') ||
    (userName &&
      userNameValid &&
      ((userSshKey && sshKeyValid) ||
        (userPassword && isPasswordAndConfirmValid)));
  return {
    errors: {
      userName: !userNameValid
        ? 'Invalid user name. Usernames may contain only lower and upper case letters, digits,\n' +
          '       underscores, or dashes. They can end with a dollar sign. Dashes are not\n' +
          '       allowed at the beginning of the username. Fully numeric usernames and\n' +
          '       usernames . or .. are also disallowed. It is not recommended to use\n' +
          '       usernames beginning with . character as their home directories will be\n' +
          '       hidden in the ls output.\n' +
          '\n' +
          '       Usernames may only be up to 32 characters long.'
        : '',
      userPassword: !userPassword
        ? ''
        : !passwordValid
        ? 'Invalid user password'
        : '',
      userConfirmPassword: !userPassword
        ? ''
        : !passwordConfirmMatchValid
        ? 'password and confirm password should be the same'
        : '',
      userSshKey: !userSshKey
        ? ''
        : !sshKeyValid
        ? "Value does not match pattern: /^(ssh-(rsa|dss|ed25519)|ecdsa-sha2-nistp(256|384|521)) \\\\S+/.'"
        : '',
    },
    disabledNext: !canProceed,
  };
}

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
  if (!nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (uniqueName === false) {
    nameError = 'Blueprint with this name already exists';
  } else if (!blueprintId && uniqueName === null) {
    // Hack to keep the error message from flickering in create mode
    nameError = 'default';
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
