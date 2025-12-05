import { DiskPartition, FilesystemPartition, Units } from './fscTypes';

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

/**
 * Calculate total filesystem size for basic mode partitions
 * @param partitions - Array of filesystem partitions
 * @returns Total size in bytes
 */
export const calculateTotalFilesystemSize = (
  partitions: FilesystemPartition[],
): number => {
  return partitions.reduce((total, partition) => {
    const sizeInBytes =
      parseInt(partition.min_size) * getConversionFactor(partition.unit);
    return total + sizeInBytes;
  }, 0);
};

/**
 * Parse a minimum disk size string (e.g., "10 GiB" or "100 GB") and convert to bytes
 * @param minsize - Minimum disk size string
 * @returns Size in bytes, or 0 if invalid or empty
 */
export const parseMinDiskSize = (minsize: string): number => {
  if (!minsize || minsize.trim() === '') {
    return 0;
  }

  // Try to parse "size unit" format (e.g., "10 GiB")
  const parts = minsize.trim().split(/\s+/);
  if (parts.length >= 2) {
    const size = parseInt(parts[0]);
    const unitStr = parts[1];
    if (!isNaN(size) && ['B', 'KiB', 'MiB', 'GiB', 'GB'].includes(unitStr)) {
      // Handle both GiB and GB (treat GB as GiB for consistency)
      const normalizedUnit = unitStr === 'GB' ? 'GiB' : (unitStr as Units);
      return size * getConversionFactor(normalizedUnit);
    }
  }

  // If no unit or invalid format, try to parse as a raw number and assume GiB
  const size = parseInt(minsize);
  if (!isNaN(size)) {
    return size * UNIT_GIB;
  }

  return 0;
};

/**
 * Calculate total filesystem size for advanced mode disk partitions
 * @param partitions - Array of disk partitions (plain partitions and LVM volume groups)
 * @param minDiskSize - Optional minimum disk size string (e.g., "10 GiB")
 * @returns Total size in bytes
 */
export const calculateTotalDiskSize = (
  partitions: DiskPartition[],
  minDiskSize?: string,
): number => {
  const partitionsTotal = partitions.reduce((total, partition) => {
    if (partition.type === 'lvm') {
      // For LVM, sum up all logical volumes
      const lvTotal = partition.logical_volumes.reduce((lvSum, lv) => {
        const sizeInBytes =
          parseInt(lv.min_size || '0') * getConversionFactor(lv.unit || 'GiB');
        return lvSum + sizeInBytes;
      }, 0);
      return total + lvTotal;
    } else {
      // For plain partitions
      const sizeInBytes =
        parseInt(partition.min_size || '0') *
        getConversionFactor(partition.unit || 'GiB');
      return total + sizeInBytes;
    }
  }, 0);

  // Add the minimum disk size if provided
  const diskSizeBytes = minDiskSize ? parseMinDiskSize(minDiskSize) : 0;

  // Return the maximum of partitions total or minimum disk size
  return Math.max(partitionsTotal, diskSizeBytes);
};
