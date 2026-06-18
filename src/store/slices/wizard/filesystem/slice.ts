import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

import { LogicalVolume } from '@/store/api/backend';

import { initialState } from './state';
import {
  DiskPartition,
  DiskPartitionBase,
  FilesystemMode,
  FilesystemPartition,
  FSType,
  PartitioningCustomization,
  PartitioningModeType,
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
      state.fileSystem.partitions = action.payload;
    },
    changeFscMode: (state, action: PayloadAction<FilesystemMode>) => {
      const currentMode = state.mode;

      // Only trigger if mode is being *changed*
      if (currentMode !== action.payload) {
        state.mode = action.payload;
        switch (action.payload) {
          case 'automatic':
            state.fileSystem.partitions = [];
            break;
          case 'basic':
            state.fileSystem.partitions = [
              {
                id: uuidv4(),
                mountpoint: '/',
                min_size: '10',
                unit: 'GiB',
              },
            ];
            break;
          case 'advanced':
            state.disk.partitions = [
              {
                id: uuidv4(),
                mountpoint: '/',
                fs_type: 'xfs',
                min_size: '10',
                unit: 'GiB',
                type: 'plain',
              },
            ];
            break;
        }
      }
    },
    clearPartitions: (state) => {
      const currentMode = state.mode;

      if (currentMode === 'basic') {
        state.fileSystem.partitions = [
          {
            id: uuidv4(),
            mountpoint: '/',
            min_size: '10',
            unit: 'GiB',
          },
        ];
      }
    },
    addPartition: (state, action: PayloadAction<FilesystemPartition>) => {
      // Duplicate partitions are allowed temporarily, the wizard is responsible for final validation
      state.fileSystem.partitions.push(action.payload);
    },
    removePartition: (
      state,
      action: PayloadAction<FilesystemPartition['id']>,
    ) => {
      const index = state.fileSystem.partitions.findIndex(
        (partition) => partition.id === action.payload,
      );
      if (index !== -1) {
        state.fileSystem.partitions.splice(index, 1);
      }
    },
    removePartitionByMountpoint: (
      state,
      action: PayloadAction<FilesystemPartition['mountpoint']>,
    ) => {
      const index = state.fileSystem.partitions.findIndex(
        (partition) => partition.mountpoint === action.payload,
      );
      if (index !== -1) {
        state.fileSystem.partitions.splice(index, 1);
      }
    },
    changePartitionMountpoint: (
      state,
      action: PayloadAction<{
        id: string;
        mountpoint: string;
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, mountpoint, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );

      if (partitionIndex !== -1) {
        if ('mountpoint' in state[customization].partitions[partitionIndex]) {
          state[customization].partitions[partitionIndex].mountpoint =
            mountpoint;
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
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, unit, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state[customization].partitions[partitionIndex].unit = unit;
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
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, min_size, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (partitionIndex !== -1) {
        state[customization].partitions[partitionIndex].min_size = min_size;
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
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, fs_type, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'fs_type' in state[customization].partitions[partitionIndex]
      ) {
        state[customization].partitions[partitionIndex].fs_type = fs_type;
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
        customization: PartitioningCustomization;
      }>,
    ) => {
      const { id, name, customization } = action.payload;
      const partitionIndex = state[customization].partitions.findIndex(
        (partition) => partition.id === id,
      );
      if (
        partitionIndex !== -1 &&
        'name' in state[customization].partitions[partitionIndex]
      ) {
        state[customization].partitions[partitionIndex].name = name;
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
      state.disk.minsize = action.payload;
    },
    changeDiskUnit: (state, action: PayloadAction<Units>) => {
      state.disk.unit = action.payload;
    },
    changeDiskType: (
      state,
      action: PayloadAction<'gpt' | 'dos' | undefined>,
    ) => {
      state.disk.type = action.payload;
    },
    addDiskPartition: (state, action: PayloadAction<DiskPartition>) => {
      state.disk.partitions.push(action.payload);
    },
    removeDiskPartition: (
      state,
      action: PayloadAction<DiskPartition['id']>,
    ) => {
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
        logicalVolume: LogicalVolume & DiskPartitionBase;
      }>,
    ) => {
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
      action: PayloadAction<PartitioningModeType>,
    ) => {
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
