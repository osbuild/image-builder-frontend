import { useEffect, useState } from 'react';

import { useAppSelector } from '../../../store/hooks';
import {
  BlueprintsResponse,
  useLazyGetBlueprintsQuery,
} from '../../../store/imageBuilderApi';
import {
  selectBlueprintName,
  selectBlueprintDescription,
  selectFileSystemPartitionMode,
  selectPartitions,
  selectWizardMode,
} from '../../../store/wizardSlice';
import {
  getDuplicateMountPoints,
  isBlueprintNameValid,
  isBlueprintDescriptionValid,
  isMountpointMinSizeValid,
} from '../validators';

export type StepValidation = {
  errors: {
    [key: string]: string;
  };
  disabledNext: boolean;
};

export function useIsBlueprintValid(): boolean {
  const filesystem = useFilesystemValidation();
  const details = useDetailsValidation();
  return !filesystem.disabledNext && !details.disabledNext;
}

export function useFilesystemValidation(): StepValidation {
  const mode = useAppSelector(selectFileSystemPartitionMode);
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

export function useDetailsValidation(): StepValidation {
  const name = useAppSelector(selectBlueprintName);
  const description = useAppSelector(selectBlueprintDescription);
  const wizardMode = useAppSelector(selectWizardMode);

  const nameValid = isBlueprintNameValid(name);
  const descriptionValid = isBlueprintDescriptionValid(description);
  const [uniqueName, setUniqueName] = useState<boolean | null>(null);

  const [trigger] = useLazyGetBlueprintsQuery();

  useEffect(() => {
    if (wizardMode === 'create' && name !== '' && nameValid) {
      trigger({ name })
        .unwrap()
        .then((response: BlueprintsResponse) => {
          if (response?.meta?.count > 0) {
            setUniqueName(false);
          } else {
            setUniqueName(true);
          }
        })
        .catch(() => {
          // If the request fails, we assume the name is unique
          setUniqueName(true);
        });
    }
  }, [wizardMode, name, setUniqueName, trigger]);

  let nameError = '';
  if (!nameValid) {
    nameError = 'Invalid blueprint name';
  } else if (uniqueName === false) {
    nameError = 'Blueprint with this name already exists';
  } else if (wizardMode === 'create' && uniqueName === null) {
    // Hack to keep the error message from flickering
    nameError = 'default';
  }

  return {
    errors: {
      name: nameError,
      description: descriptionValid ? '' : 'Invalid description',
    },
    disabledNext: !!nameError || !descriptionValid,
  };
}
