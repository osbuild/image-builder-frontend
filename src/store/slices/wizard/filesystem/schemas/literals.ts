import z from 'zod';

export const partitioningModeSchema = z.literal(['raw', 'lvm', 'auto-lvm']);

export const filesystemModeSchema = z.literal([
  'automatic',
  'basic',
  'advanced',
]);

export const unitsSchema = z.literal(['B', 'MiB', 'GiB']);
export const unitsWarningSchema = unitsSchema.refine(
  (unit) => unit !== 'B',
  'The Wizard only supports MiB or GiB. Adjust or keep the current value.',
);

export const filesystemTypeSchema = z.literal(['ext4', 'xfs', 'vfat', 'swap']);
