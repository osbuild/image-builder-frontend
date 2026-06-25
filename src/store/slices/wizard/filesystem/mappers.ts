import { createSelector } from '@reduxjs/toolkit';

import {
  selectDiskMinsize,
  selectDiskPartitions,
  selectDiskType,
  selectDiskUnit,
  selectFilesystemPartitions,
  selectFscMode,
  selectPartitioningMode,
} from './selectors';
import { convertToBytes } from './utilities';

const mapDisk = createSelector(
  [
    selectFscMode,
    selectDiskMinsize,
    selectDiskUnit,
    selectDiskPartitions,
    selectDiskType,
  ],
  (fscMode, minsize, unit, partitions, diskType) => {
    if (fscMode !== 'advanced') {
      return undefined;
    }

    const diskPartitions = partitions.map((partition) => {
      if (partition.type === 'lvm') {
        return {
          minsize: partition.min_size + ' ' + partition.unit,
          name: partition.name,
          type: partition.type,
          logical_volumes: partition.logical_volumes.map((lv) => {
            return {
              minsize: lv.min_size + ' ' + lv.unit,
              name: lv.name,
              fs_type: lv.fs_type,
              mountpoint: lv.mountpoint,
            };
          }),
        };
      }

      if (partition.type === 'btrfs') {
        return {
          minsize: partition.min_size + ' ' + partition.unit,
          type: partition.type,
          subvolumes: partition.subvolumes,
        };
      }

      return {
        minsize: partition.min_size + ' ' + partition.unit,
        fs_type: partition.fs_type,
        mountpoint: partition.mountpoint,
        type: partition.type,
      };
    });

    return {
      disk: {
        type: diskType,
        minsize: minsize ? minsize + ' ' + unit : undefined,
        partitions: diskPartitions,
      },
    };
  },
);

const mapFilesystem = createSelector(
  [selectFscMode, selectFilesystemPartitions],
  (fscMode, partitions) => {
    if (fscMode === 'basic') {
      const filesystem = partitions.map((partition) => {
        return {
          min_size: convertToBytes(partition.min_size, partition.unit),
          mountpoint: partition.mountpoint,
        };
      });
      return { filesystem };
    }

    return undefined;
  },
);

const mapPartitioningMode = createSelector(
  [selectPartitioningMode],
  (partitioningMode) => {
    if (!partitioningMode) {
      return undefined;
    }

    return {
      partitioning_mode: partitioningMode,
    };
  },
);

export const mapFilesystemCustomizations = createSelector(
  [mapDisk, mapFilesystem, mapPartitioningMode],
  (disk, filesystem, partitionMode) => ({
    ...disk,
    ...filesystem,
    ...partitionMode,
  }),
);
