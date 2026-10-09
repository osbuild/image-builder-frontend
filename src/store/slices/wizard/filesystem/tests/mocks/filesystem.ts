import type {
  FilesystemPartition,
  LogicalVolume,
  PlainPartition,
  VolumeGroup,
} from '@/store/slices/wizard';

// Basic filesystem partition factory
export const createBasicPartition = (
  overrides: Partial<FilesystemPartition> = {},
): FilesystemPartition => ({
  id: `partition-${Math.random().toString(36).slice(2, 11)}`,
  mountpoint: '/',
  min_size: '10',
  unit: 'GiB',
  ...overrides,
});

// Advanced disk partition factory
export const createPlainPartition = (
  overrides: Partial<PlainPartition> = {},
): PlainPartition => ({
  id: `partition-${Math.random().toString(36).slice(2, 11)}`,
  mountpoint: '/boot',
  min_size: '1',
  unit: 'GiB',
  fs_type: 'ext4',
  type: 'plain',
  ...overrides,
});

// Logical volume factory
export const createLogicalVolume = (
  overrides: Partial<LogicalVolume> = {},
): LogicalVolume => ({
  id: `lv-${Math.random().toString(36).slice(2, 11)}`,
  mountpoint: '/',
  min_size: '10',
  unit: 'GiB',
  name: 'root',
  fs_type: 'xfs',
  ...overrides,
});

// Volume group factory
export const createVolumeGroup = (
  logicalVolumes: LogicalVolume[] = [],
  overrides: Partial<VolumeGroup> = {},
): VolumeGroup => ({
  id: `vg-${Math.random().toString(36).slice(2, 11)}`,
  type: 'lvm',
  name: 'vg0',
  min_size: undefined,
  unit: undefined,
  logical_volumes: logicalVolumes,
  ...overrides,
});
