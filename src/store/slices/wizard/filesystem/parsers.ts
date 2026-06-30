import { Customizations } from '@/store/api/backend';

import { initialState } from './state';
import { FilesystemSlice, Units } from './types';
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

const parseDisk = ({ disk }: Customizations): FilesystemSlice['disk'] => {
  const defaults = initialState.disk;
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

const parseFilesystem = ({
  filesystem,
}: Customizations): FilesystemSlice['fileSystem'] => {
  if (!filesystem) {
    return initialState.fileSystem;
  }

  return {
    partitions: filesystem.map(convertFilesystemToPartition),
  };
};

const parsePartitioningMode = ({
  partitioning_mode,
}: Customizations): FilesystemSlice['partitioningMode'] => {
  if (!partitioning_mode) {
    return initialState.partitioningMode;
  }

  return partitioning_mode;
};

export const parseFilesystemFromRequest = ({
  customizations,
}: RequestLike): FilesystemSlice => ({
  mode: parseMode(customizations),
  disk: parseDisk(customizations),
  fileSystem: parseFilesystem(customizations),
  partitioningMode: parsePartitioningMode(customizations),
});
