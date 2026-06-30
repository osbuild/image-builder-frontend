import { v4 as uuidv4 } from 'uuid';

import { UNIT_GIB, UNIT_MIB } from '@/constants';
import {
  BtrfsVolume,
  Filesystem,
  FilesystemTyped,
  LogicalVolume,
  VolumeGroup,
} from '@/store/api/backend';

import { DiskPartition, FilesystemPartition, FSType, Units } from './types';

const defaultMountpointPreferences = [
  '/home',
  '/var',
  '/data',
  '/opt',
  '/srv',
  '/tmp',
  '/app',
];

export const getConversionFactor = (units: Units) => {
  switch (units) {
    case 'B':
      return 1;
    case 'MiB':
      return UNIT_MIB;
    case 'GiB':
      return UNIT_GIB;
  }
};

export const convertToBytes = (minSize: string, unit: Units): number => {
  return minSize.length > 0 ? parseInt(minSize) * getConversionFactor(unit) : 0;
};

export const parseSizeUnit = (bytesize: string): [string, Units] => {
  const parsed = parseInt(bytesize, 10);
  let size: number;
  let unit: Units = 'GiB';

  if (parsed % UNIT_GIB === 0) {
    size = parsed / UNIT_GIB;
    unit = 'GiB';
  } else if (parsed % UNIT_MIB === 0) {
    size = parsed / UNIT_MIB;
    unit = 'MiB';
  } else if (parsed) {
    size = parsed;
    unit = 'B';
  } else {
    size = 10;
    unit = 'GiB';
  }

  return [String(size), unit];
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

export const convertFilesystemToPartition = (
  filesystem: Filesystem,
): FilesystemPartition => {
  const id = uuidv4();
  const [size, unit] = parseSizeUnit(filesystem.min_size);
  const partition = {
    mountpoint: filesystem.mountpoint,
    min_size: size,
    id: id,
    unit: unit as Units,
  };
  return partition;
};

export const convertDiskToFscDisk = (
  disk: FilesystemTyped | VolumeGroup | BtrfsVolume,
): DiskPartition => {
  const id = uuidv4();
  let size;
  let unit;

  if (disk.minsize) {
    [size, unit] = disk.minsize && disk.minsize.split(' ');
  }

  if ('logical_volumes' in disk) {
    return {
      id: id,
      min_size: size,
      unit: (unit || 'GiB') as Units,
      name: disk.name,
      type: disk.type,
      logical_volumes: disk.logical_volumes.map((lv) =>
        convertLogicalVolume(lv),
      ),
    };
  }

  if ('subvolumes' in disk) {
    return {
      id: id,
      min_size: size,
      unit: unit as Units,
      type: disk.type,
      subvolumes: disk.subvolumes,
    };
  }

  return {
    id: id,
    fs_type: disk.fs_type,
    mountpoint: disk.mountpoint,
    min_size: size,
    unit: (unit || 'GiB') as Units,
    type: disk.type,
  };
};

export const convertLogicalVolume = (volume: LogicalVolume) => {
  const id = uuidv4();
  let size;
  let unit;

  if (volume.minsize) {
    [size, unit] = volume.minsize && volume.minsize.split(' ');
  }

  return {
    id: id,
    min_size: size,
    unit: (unit || 'GiB') as Units,
    name: volume.name,
    fs_type: volume.fs_type,
    mountpoint: volume.mountpoint,
  };
};
