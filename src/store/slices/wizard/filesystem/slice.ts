import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { emptyDisk, initialState } from './state';
import {
  DiskPartition,
  FilesystemMode,
  FilesystemPartition,
  FSType,
  LogicalVolumeWithBase,
  PartitioningMode,
  Units,
} from './types';

import { initializeWizard, loadWizardState } from '../actions';

export const filesystemSlice = createSlice({
  name: 'wizard/filesystem',
  initialState,
  reducers: {
    changeFileSystemConfiguration: (
      state,
      action: PayloadAction<FilesystemPartition[]>,
    ) => {
      if (state.mode !== 'basic') return;
      state.filesystem.partitions = action.payload;
    },
    changeFscMode: (state, action: PayloadAction<FilesystemMode>) => {
      if (state.mode === action.payload) return;

      switch (action.payload) {
        case 'automatic':
          return { mode: 'automatic' };
        case 'basic':
          return {
            mode: 'basic',
            filesystem: {
              partitions: [
                {
                  id: crypto.randomUUID(),
                  mountpoint: '/',
                  min_size: '10',
                  unit: 'GiB',
                },
              ],
            },
          };
        case 'advanced':
          return {
            mode: 'advanced',
            disk: {
              ...emptyDisk.disk,
              partitions: [
                {
                  id: crypto.randomUUID(),
                  mountpoint: '/',
                  fs_type: 'xfs',
                  min_size: '10',
                  unit: 'GiB',
                  type: 'plain',
                },
              ],
            },
          };
      }
    },
    clearPartitions: (state) => {
      const currentMode = state.mode;

      if (currentMode === 'basic') {
        state.filesystem.partitions = [
          {
            id: crypto.randomUUID(),
            mountpoint: '/',
            min_size: '10',
            unit: 'GiB',
          },
        ];
      }
    },
    addPartition: (state, action: PayloadAction<FilesystemPartition>) => {
      if (state.mode !== 'basic') return;
      // Duplicate partitions are allowed temporarily, the wizard is responsible for final validation
      state.filesystem.partitions.push(action.payload);
    },
    removePartition: (
      state,
      action: PayloadAction<FilesystemPartition['id']>,
    ) => {
      if (state.mode !== 'basic') return;
      const index = state.filesystem.partitions.findIndex(
        (partition) => partition.id === action.payload,
      );
      if (index !== -1) {
        state.filesystem.partitions.splice(index, 1);
      }
    },
    removePartitionByMountpoint: (
      state,
      action: PayloadAction<FilesystemPartition['mountpoint']>,
    ) => {
      if (state.mode !== 'basic') return;
      const index = state.filesystem.partitions.findIndex(
        (partition) => partition.mountpoint === action.payload,
      );
      if (index !== -1) {
        state.filesystem.partitions.splice(index, 1);
      }
    },
    changePartitionMountpoint: (
      state,
      action: PayloadAction<{
        id: string;
        mountpoint: string;
      }>,
    ) => {
      if (state.mode === 'automatic') return;
      const { id, mountpoint } = action.payload;

      if (state.mode === 'basic') {
        const partitionIndex = state.filesystem.partitions.findIndex(
          (partition) => partition.id === id,
        );

        if (partitionIndex !== -1) {
          if ('mountpoint' in state.filesystem.partitions[partitionIndex]) {
            state.filesystem.partitions[partitionIndex].mountpoint = mountpoint;
            return;
          }
        }
        return;
      }

      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );

      if (partitionIndex !== -1) {
        if ('mountpoint' in state.disk.partitions[partitionIndex]) {
          state.disk.partitions[partitionIndex].mountpoint = mountpoint;
          return;
        }
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].mountpoint =
              mountpoint;
          }
        }
      }
    },
    changePartitionUnit: (
      state,
      action: PayloadAction<{
        id: string;
        unit: Units;
      }>,
    ) => {
      if (state.mode === 'automatic') return;
      const { id, unit } = action.payload;

      if (state.mode === 'basic') {
        const partitionIndex = state.filesystem.partitions.findIndex(
          (partition) => partition.id === id,
        );
        if (partitionIndex !== -1) {
          state.filesystem.partitions[partitionIndex].unit = unit;
          return;
        }
        return;
      }

      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state.disk.partitions[partitionIndex].unit = unit;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].unit = unit;
          }
        }
      }
    },
    changePartitionMinSize: (
      state,
      action: PayloadAction<{
        id: string;
        min_size: string;
      }>,
    ) => {
      if (state.mode === 'automatic') return;
      const { id, min_size } = action.payload;

      if (state.mode === 'basic') {
        const partitionIndex = state.filesystem.partitions.findIndex(
          (partition) => partition.id === id,
        );
        if (partitionIndex !== -1) {
          state.filesystem.partitions[partitionIndex].min_size = min_size;
          return;
        }
        return;
      }

      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state.disk.partitions[partitionIndex].min_size = min_size;
        return;
      }
      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].min_size = min_size;
          }
        }
      }
    },
    changePartitionType: (
      state,
      action: PayloadAction<{
        id: string;
        fs_type: FSType;
      }>,
    ) => {
      if (state.mode === 'automatic') return;
      const { id, fs_type } = action.payload;

      if (state.mode === 'basic') {
        const partitionIndex = state.filesystem.partitions.findIndex(
          (partition) => partition.id === id,
        );
        if (
          partitionIndex !== -1 &&
          'fs_type' in state.filesystem.partitions[partitionIndex]
        ) {
          state.filesystem.partitions[partitionIndex].fs_type = fs_type;
          return;
        }
        return;
      }

      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'fs_type' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].fs_type = fs_type;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].fs_type = fs_type;
          }
        }
      }
    },
    changePartitionName: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
      }>,
    ) => {
      if (state.mode === 'automatic') return;
      const { id, name } = action.payload;

      if (state.mode === 'basic') {
        const partitionIndex = state.filesystem.partitions.findIndex(
          (partition) => partition.id === id,
        );
        if (
          partitionIndex !== -1 &&
          'name' in state.filesystem.partitions[partitionIndex]
        ) {
          state.filesystem.partitions[partitionIndex].name = name;
          return;
        }
        return;
      }

      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'name' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].name = name;
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === id,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes[logicalVolumeIndex].name = name;
          }
        }
      }
    },
    changeDiskMinsize: (state, action: PayloadAction<string>) => {
      if (state.mode !== 'advanced') return;
      state.disk.minsize = action.payload;
    },
    changeDiskUnit: (state, action: PayloadAction<Units>) => {
      if (state.mode !== 'advanced') return;
      state.disk.unit = action.payload;
    },
    changeDiskType: (
      state,
      action: PayloadAction<'gpt' | 'dos' | undefined>,
    ) => {
      if (state.mode !== 'advanced') return;
      state.disk.type = action.payload;
    },
    addDiskPartition: (state, action: PayloadAction<DiskPartition>) => {
      if (state.mode !== 'advanced') return;
      state.disk.partitions.push(action.payload);
    },
    removeDiskPartition: (
      state,
      action: PayloadAction<DiskPartition['id']>,
    ) => {
      if (state.mode !== 'advanced') return;
      const index = state.disk.partitions.findIndex(
        (partition) => partition.id === action.payload,
      );
      if (index !== -1) {
        state.disk.partitions.splice(index, 1);
        return;
      }

      for (const partition of state.disk.partitions) {
        if (partition.type === 'lvm') {
          const logicalVolumeIndex = partition.logical_volumes.findIndex(
            (lv) => lv.id === action.payload,
          );

          if (logicalVolumeIndex !== -1) {
            partition.logical_volumes.splice(logicalVolumeIndex, 1);
          }
        }
      }
    },
    changeDiskPartitionMinsize: (
      state,
      action: PayloadAction<{ id: string; min_size: string }>,
    ) => {
      if (state.mode !== 'advanced') return;
      const { id, min_size } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state.disk.partitions[partitionIndex].min_size = min_size;
      }
    },
    changeDiskPartitionName: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      if (state.mode !== 'advanced') return;
      const { id, name } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'name' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].name = name;
      }
    },
    addLogicalVolumeToVolumeGroup: (
      state,
      action: PayloadAction<{
        vgId: string;
        logicalVolume: LogicalVolumeWithBase;
      }>,
    ) => {
      if (state.mode !== 'advanced') return;
      const { vgId, logicalVolume } = action.payload;
      const partitionIndex = state.disk.partitions.findIndex(
        (partition) => partition.id === vgId,
      );
      if (
        partitionIndex !== -1 &&
        'logical_volumes' in state.disk.partitions[partitionIndex]
      ) {
        state.disk.partitions[partitionIndex].logical_volumes.push(
          logicalVolume,
        );
      }
    },
    changePartitioningMode: (
      state,
      action: PayloadAction<PartitioningMode | undefined>,
    ) => {
      if (state.mode !== 'basic') return;
      state.partitioningMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // we need to add these cases so that the submodule slice also
      // reacts to the top-level initialize and loadWizardState calls
      .addCase(initializeWizard, () => initialState)
      .addCase(
        loadWizardState,
        // Payload may lack `filesystem` if loading a blueprint serialised before
        // this subslice existed, so fall back defensively despite the type.
        (_state, action) =>
          (action.payload as Partial<typeof action.payload>).filesystem ??
          initialState,
      );
  },
});

export const {
  changeFileSystemConfiguration,
  changeFscMode,
  clearPartitions,
  addPartition,
  removePartition,
  removePartitionByMountpoint,
  changePartitionMountpoint,
  changePartitionUnit,
  changePartitionMinSize,
  changePartitionType,
  changePartitionName,
  changeDiskMinsize,
  changeDiskUnit,
  changeDiskType,
  addDiskPartition,
  removeDiskPartition,
  changeDiskPartitionMinsize,
  changeDiskPartitionName,
  addLogicalVolumeToVolumeGroup,
  changePartitioningMode,
} = filesystemSlice.actions;
