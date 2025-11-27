import {
  DiskPartition,
  FilesystemPartition,
  FSType,
  PartitioningCustomization,
  Units,
} from './fscTypes';

import { UNIT_GIB, UNIT_KIB, UNIT_MIB } from '../../../../constants';

export const normalizeSuffix = (rawSuffix: string) => {
  const suffix = rawSuffix.replace(/^\/+/g, '');
  return suffix.length > 0 ? '/' + suffix : '';
};

export const getPrefix = (mountpoint: string) => {
  return mountpoint.split('/')[1] ? '/' + mountpoint.split('/')[1] : '/';
};

export const getSuffix = (mountpoint: string) => {
  const prefix = getPrefix(mountpoint);
  return normalizeSuffix(mountpoint.substring(prefix.length));
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
  return true;
};
