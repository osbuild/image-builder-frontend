import { Filesystem as ApiFilesystem } from '@/store/api/backend';

import {
  createFilesystemSchema,
  FilesystemSlice,
  type Minsize,
  MountpointEntry,
  optionalMinsizeSchema,
  optionalNameSchema,
  Partition,
  PartitionNameEntry,
  partitionNameEntryListSchema,
  requiredMinsizeSchema,
  unitsWarningSchema,
} from './schemas';

import { ValidationResult } from '../types';
import { validateList, validateSchema } from '../validators';

export const validateRequiredMinsize = (
  partition: Partition,
  requiredPartitions: ApiFilesystem[],
  mode: 'package' | 'image',
): ValidationResult<Minsize> => {
  const parsed = validateSchema(requiredMinsizeSchema, partition.min_size);
  const { issues: warnings } = validateSchema(
    unitsWarningSchema,
    partition.unit,
  );

  // Only disk partitions have the `type` field
  if ('type' in partition) {
    return {
      data: parsed.data,
      errors: parsed.issues,
      warnings,
    };
  }

  const { filesystemPartitionSchema } = createFilesystemSchema(
    mode,
    requiredPartitions,
  );
  const { issues } = validateSchema(filesystemPartitionSchema, partition);

  return {
    data: parsed.data,
    errors: issues.filter(
      (issue) => issue.path && issue.path[0] === 'min_size',
    ),
    warnings,
  };
};

export const validateOptionalMinsize = (
  size: Minsize,
): ValidationResult<Minsize> => {
  const result = validateSchema(optionalMinsizeSchema, size);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validatePartitionName = (name?: string | undefined) => {
  const result = validateSchema(optionalNameSchema, name);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validatePartitionNameList = (names: PartitionNameEntry[]) => {
  const result = validateList(partitionNameEntryListSchema, names);

  return {
    data: result.data,
    // NOTE: we re-write the zod path to use the partition id rather
    // than the index. It just makes discovering the offending item
    // a lot easier. And we can deal with a flat array of partition names
    // rather than nested ones (especially for logical volumes)
    errors: result.issues.map((issue) => {
      const [index, ...rest] = issue.path ?? [];
      const entry = typeof index === 'number' ? names[index] : undefined;

      return entry ? { ...issue, path: [entry.id, ...rest] } : issue;
    }),
  };
};

export const validateMountpoint = (
  mountpoint: string,
  mode: 'package' | 'image',
) => {
  const { mountpointSchema } = createFilesystemSchema(mode);
  const result = validateSchema(mountpointSchema, mountpoint);

  return {
    data: result.data,
    errors: result.issues,
  };
};

export const validateMountpointList = (
  mountpoints: MountpointEntry[],
  mode: 'package' | 'image',
) => {
  const { mountpointEntryListSchema } = createFilesystemSchema(mode);
  const result = validateList(mountpointEntryListSchema, mountpoints);

  return {
    data: result.data,
    // NOTE: we re-write the zod path to use the partition id rather
    // than the index. It just makes discovering the offending item
    // a lot easier. And we can deal with a flat array of mountpoints
    // rather than nested ones (especially for logical volumes)
    errors: result.issues.map((issue) => {
      const [index, ...rest] = issue.path ?? [];
      const entry = typeof index === 'number' ? mountpoints[index] : undefined;

      return entry ? { ...issue, path: [entry.id, ...rest] } : issue;
    }),
  };
};

export const validateFilesystemSlice = (
  filesystem: FilesystemSlice,
  mode: 'package' | 'image',
  requiredPartitions: ApiFilesystem[] = [],
  shouldHide: boolean = false,
): ValidationResult<FilesystemSlice> => {
  if (shouldHide) {
    return {
      errors: [],
    };
  }

  const { filesystemSliceSchema } = createFilesystemSchema(
    mode,
    requiredPartitions,
  );
  const result = validateSchema(filesystemSliceSchema, filesystem);

  return {
    data: result.data,
    errors: result.issues,
  };
};
