import { createSelector } from '@reduxjs/toolkit';

import { UNIT_GIB } from '@/constants';
import { RootState } from '@/store';

import type {
  DiskPartition,
  FilesystemPartition,
  MountpointEntry,
  PartitionNameEntry,
  Units,
  VolumeGroup,
} from './types';
import { getConversionFactor } from './utilities';

const EMPTY_DISK_PARTITIONS: DiskPartition[] = [];
const EMPTY_FILESYSTEM_PARTITIONS: FilesystemPartition[] = [];
const EMPTY_MOUNTPOINTS: MountpointEntry[] = [];
const EMPTY_PARTITION_NAMES: PartitionNameEntry[] = [];

export const selectFscMode = (state: RootState) => {
  return state.wizard.filesystem.mode;
};

export const selectDiskType = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'advanced') {
    return state.wizard.filesystem.disk.type;
  }
};

export const selectDiskMinsize = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'advanced') {
    return state.wizard.filesystem.disk.minsize;
  }
};

export const selectDiskUnit = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'advanced') {
    return state.wizard.filesystem.disk.unit;
  }
  // TODO: maybe return default for typesafety
};

export const selectDiskPartitions = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'advanced') {
    return state.wizard.filesystem.disk.partitions;
  }
  return EMPTY_DISK_PARTITIONS;
};

export const selectFilesystemPartitions = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'basic') {
    return state.wizard.filesystem.filesystem.partitions;
  }
  return EMPTY_FILESYSTEM_PARTITIONS;
};

export const selectPartitioningMode = (state: RootState) => {
  if (state.wizard.filesystem.mode === 'basic') {
    return state.wizard.filesystem.partitioningMode;
  }
};

export const selectPlainPartitions = createSelector(
  [selectDiskPartitions],
  (partitions) => partitions.filter((p) => p.type !== 'lvm'),
);

export const selectVolumeGroups = createSelector(
  [selectDiskPartitions],
  (partitions) => partitions.filter((p) => p.type === 'lvm') as VolumeGroup[],
);

export const selectPartitionNames = createSelector(
  [selectDiskPartitions],
  (partitions) => {
    return partitions
      .flatMap((partition) => {
        if (partition.type !== 'lvm') {
          return EMPTY_PARTITION_NAMES;
        }

        const logicalVolumeNames = partition.logical_volumes.map(
          ({ id, name }) => ({
            id,
            name,
          }),
        );

        return [
          { id: partition.id, name: partition.name },
          ...logicalVolumeNames,
        ];
      })
      .filter((entry): entry is PartitionNameEntry => Boolean(entry.name));
  },
);

export const selectMountpoints = createSelector(
  [selectFilesystemPartitions, selectDiskPartitions],
  (fsPartitions, diskPartitions) => {
    if (fsPartitions.length > 0) {
      return fsPartitions
        .map(({ id, mountpoint }) => ({ id, mountpoint }))
        .filter(({ mountpoint }) => Boolean(mountpoint));
    }

    if (diskPartitions.length > 0) {
      return diskPartitions
        .flatMap((p) => {
          if (p.type === 'plain')
            return [{ id: p.id, mountpoint: p.mountpoint }];
          if (p.type === 'lvm')
            return p.logical_volumes.map(({ id, mountpoint }) => ({
              id,
              mountpoint,
            }));
          return EMPTY_MOUNTPOINTS;
        })
        .filter((entry): entry is MountpointEntry => Boolean(entry.mountpoint));
    }

    return EMPTY_MOUNTPOINTS;
  },
);

export const selectBasicPartitionCount = createSelector(
  [selectFilesystemPartitions],
  (partitions) => partitions.length,
);

export const selectAdvancedPartitionCount = createSelector(
  [selectDiskPartitions],
  (partitions) => {
    return partitions.filter((p) => !('logical_volumes' in p)).length;
  },
);

export const selectPartitionCount = createSelector(
  [selectFscMode, selectBasicPartitionCount, selectAdvancedPartitionCount],
  (mode, basicCount, advancedCount) => {
    if (mode === 'basic') return basicCount;
    if (mode === 'advanced') return advancedCount;
    return 0;
  },
);

export const selectLogicalVolumeCount = createSelector(
  [selectFscMode, selectDiskPartitions],
  (mode, partitions) => {
    if (mode !== 'advanced') return 0;
    return partitions.reduce((acc, partition) => {
      if ('logical_volumes' in partition) {
        return acc + partition.logical_volumes.length;
      }
      return acc;
    }, 0);
  },
);

export const selectFSConfigurationsCount = createSelector(
  [selectPartitionCount, selectLogicalVolumeCount],
  (partitions, volumes) => partitions + volumes,
);

const getSize = (partition: {
  min_size?: string | undefined;
  unit?: Units | undefined;
}) => {
  const conversionFactor = getConversionFactor(partition.unit || 'B');
  const size = Number(partition.min_size || 0) * conversionFactor;
  return Number(size / UNIT_GIB);
};

export const selectBasicFSMinSize = createSelector(
  [selectFilesystemPartitions],
  (partitions) => {
    return partitions.reduce((acc, partition) => {
      return acc + getSize(partition);
    }, 0);
  },
);

export const selectAdvancedFSMinSize = createSelector(
  [selectDiskPartitions],
  (partitions) => {
    return partitions.reduce((acc, partition) => {
      if ('logical_volumes' in partition) {
        return (
          acc +
          partition.logical_volumes.reduce((acc, lv) => acc + getSize(lv), 0)
        );
      }

      return acc + getSize(partition);
    }, 0);
  },
);

export const selectImageMinSize = createSelector(
  [selectFscMode, selectBasicFSMinSize, selectAdvancedFSMinSize],
  (mode, basicSize, advancedSize) => {
    if (mode === 'basic') return basicSize;
    if (mode === 'advanced') return advancedSize;
    return undefined;
  },
);

// export the whole subslice. this is quite useful for validating
// against a zod schema
export const selectFilesystemSlice = (state: RootState) =>
  state.wizard.filesystem;
