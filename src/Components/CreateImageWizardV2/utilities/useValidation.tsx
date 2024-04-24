import { useAppSelector } from '../../../store/hooks';
import {
  selectBlueprintName,
  selectBlueprintDescription,
  selectFileSystemPartitionMode,
  selectPartitions,
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
      errors[`min-size-${partition.id}`] = 'Invalid size';
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

  const nameValid = isBlueprintNameValid(name);
  const descriptionValid = isBlueprintDescriptionValid(description);
  return {
    errors: {
      name: nameValid ? '' : 'Invalid name',
      description: descriptionValid ? '' : 'Invalid description',
    },
    disabledNext: !nameValid || !descriptionValid,
  };
}
