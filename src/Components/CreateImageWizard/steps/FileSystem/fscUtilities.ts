import {
  DiskPartition,
  FilesystemPartition,
  FSType,
  PartitioningCustomization,
  Units,
} from './fscTypes';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../constants';

const defaultMountpointPreferences = [
  '/home',
  '/var',
  '/data',
  '/opt',
  '/srv',
  '/tmp',
  '/app',
];

export const normalizeSubpath = (rawSubpath: string) => {
  const subpath = rawSubpath.replace(/^\/+/g, '');
  return subpath.length > 0 ? '/' + subpath : '';
};

export const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};

export const getSubpath = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return normalizeSubpath(mountpoint.substring(prefix.length));
};

export const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'B':
      return 1;
    case 'KiB':
      return UNIT_KIB;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};

export const isPartitionTypeAvailable = (
  type: FSType,
  partition: FilesystemPartition | DiskPartition,
) => {
  if ('type' in partition && partition.type === 'plain') {
    // 'swap' is not allowed for plain partitions
    if (type === 'swap') {
      return false;
    }
    // 'vfat' is not allowed for plain '/boot/' partitions
    if (partition.mountpoint === '/boot' && type === 'vfat') {
      return false;
    }
    // 'ext4' and 'xfs' are not allowed for plain '/boot/efi' partitions
    if (
      partition.mountpoint === '/boot/efi' &&
      (type === 'ext4' || type === 'xfs')
    ) {
      return false;
    }
    return true;
  }
  return true;
};

export const isMountpointPrefixAvailable = (
  prefix: string,
  partition: FilesystemPartition | DiskPartition,
  customization: PartitioningCustomization,
  blueprintMode: string,
): boolean => {
  // mountpoint '/' is not allowed in filesystem customization
  // as it is added and not removable from the start to ensure
  // valid filesystem schema
  if (customization === 'fileSystem' && prefix === '/') {
    return false;
  }
  // mountpoint '/boot' is not allowed in LVM
  if ('name' in partition && prefix === '/boot') {
    return false;
  }

  if (blueprintMode === 'image' && prefix !== '/var') {
    return false;
  }

  return true;
};

export const getAllMountpoints = (
  filesystemPartitions: FilesystemPartition[],
  diskPartitions: DiskPartition[],
): Set<string> => {
  const mountpoints = new Set<string>();

  for (const partition of filesystemPartitions) {
    if (partition.mountpoint) {
      mountpoints.add(partition.mountpoint);
    }
  }

  for (const partition of diskPartitions) {
    if ('mountpoint' in partition && partition.mountpoint) {
      mountpoints.add(partition.mountpoint);
    }
    if ('type' in partition && partition.type === 'lvm') {
      for (const lv of partition.logical_volumes) {
        if ('mountpoint' in lv && lv.mountpoint) {
          mountpoints.add(lv.mountpoint);
        }
      }
    }
  }

  return mountpoints;
};

export const createNumberedMountpoint = (
  baseMount: string,
  existingMountpoints: Set<string>,
): string => {
  for (let i = 1; ; i++) {
    const candidate = `${baseMount}/dir${i}`;
    if (!existingMountpoints.has(candidate)) {
      return candidate;
    }
  }
};

export const getNextAvailableMountpoint = (
  filesystemPartitions: FilesystemPartition[],
  diskPartitions: DiskPartition[],
  inImageMode: boolean = false,
): string => {
  const existingMountpoints = getAllMountpoints(
    filesystemPartitions,
    diskPartitions,
  );

  if (inImageMode) {
    return createNumberedMountpoint('/var', existingMountpoints);
  }

  for (const mountpoint of defaultMountpointPreferences) {
    if (!existingMountpoints.has(mountpoint)) {
      return mountpoint;
    }
  }
  return createNumberedMountpoint('/home', existingMountpoints);
};
