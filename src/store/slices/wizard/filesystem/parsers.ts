import { Customizations } from '@/store/api/backend';

import { emptyDisk, emptyFilesystem } from './state';
import {
  Disk,
  Filesystem,
  FilesystemSlice,
  PartitioningMode,
  Units,
} from './types';
import {
  convertDiskToFscDisk,
  convertFilesystemToPartition,
} from './utilities';

import { RequestLike } from '../types';

const parseMode = ({
  filesystem,
  disk,
}: Customizations): FilesystemSlice['mode'] => {
  if (filesystem) {
    return 'basic';
  }

  if (disk) {
    return 'advanced';
  }

  return 'automatic';
};

const parseDisk = ({ disk }: Customizations): Disk => {
  const defaults = emptyDisk.disk;
  if (!disk) {
    return defaults;
  }

  const [minsize, unit] = disk.minsize?.split(' ') || [
    defaults.minsize,
    defaults.unit,
  ];
  return {
    minsize: minsize,
    unit: unit as Units,
    type: disk.type || defaults.type,
    partitions: disk.partitions.map(convertDiskToFscDisk),
  };
};

const parseFilesystem = ({ filesystem }: Customizations): Filesystem => {
  if (!filesystem) {
    return emptyFilesystem.filesystem;
  }

  return {
    partitions: filesystem.map(convertFilesystemToPartition),
  };
};

const parsePartitioningMode = ({
  partitioning_mode,
}: Customizations): PartitioningMode | undefined => {
  if (!partitioning_mode) {
    return emptyFilesystem.partitioningMode;
  }

  return partitioning_mode;
};

export const parseFilesystemFromRequest = ({
  customizations,
}: RequestLike): FilesystemSlice => {
  const mode = parseMode(customizations);

  if (mode === 'automatic') {
    return { mode };
  }

  if (mode === 'basic') {
    return {
      mode,
      filesystem: parseFilesystem(customizations),
      partitioningMode: parsePartitioningMode(customizations),
    };
  }

  return {
    mode,
    disk: parseDisk(customizations),
  };
};
