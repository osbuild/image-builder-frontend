import { createSelector } from '@reduxjs/toolkit';

import { UNIT_GIB } from '@/constants';
import { RootState } from '@/store';

import { Units } from './types';
import { getConversionFactor } from './utilities';

export const selectFscMode = (state: RootState) => {
  return state.wizard.filesystem.mode;
};

export const selectDiskType = (state: RootState) => {
  return state.wizard.filesystem.disk.type;
};

export const selectDiskMinsize = (state: RootState) => {
  return state.wizard.filesystem.disk.minsize;
};

export const selectDiskUnit = (state: RootState) => {
  return state.wizard.filesystem.disk.unit;
};

export const selectDiskPartitions = (state: RootState) => {
  return state.wizard.filesystem.disk.partitions;
};

export const selectFilesystemPartitions = (state: RootState) => {
  return state.wizard.filesystem.fileSystem.partitions;
};

export const selectPartitioningMode = (state: RootState) => {
  return state.wizard.filesystem.partitioningMode;
};

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
