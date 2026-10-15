import z from 'zod';

import { UNIT_GIB } from '@/constants';
import { Filesystem as ApiFilesystem } from '@/store/api/backend';
import { uniqueBy } from '@/store/slices/wizard/utilities';

import {
  filesystemTypeSchema,
  partitioningModeSchema,
  unitsSchema,
} from './literals';
import {
  imageModeMountpointSchema,
  packageModeMountpointSchema,
} from './mountpoints';
import { uniqueMountpoints } from './utilities';

import { convertToBytes } from '../utilities';

const automaticSchema = z.object({
  mode: z.literal('automatic'),
});

export const nameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9+_.][a-zA-Z0-9+_.-]*$/, 'Invalid partition name');

export const optionalNameSchema = z
  .string()
  .trim()
  .transform((name) => name || undefined)
  .pipe(nameSchema.optional());

export const partitionNameEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const partitionNameEntryListSchema = z
  .array(partitionNameEntrySchema)
  .superRefine(uniqueBy('partition name', 'name', (p) => p.name));

const minsizeSchema = z
  .string()
  .refine((value) => value === '' || /^\d+$/.test(value), {
    error: 'Minsize should be a numeric value only',
    abort: true,
  });

export const requiredMinsizeSchema = minsizeSchema
  .refine((value) => value !== '', 'Partition size is required')
  .refine(
    (value) => Number(value) > 0,
    'Minsize should be positive and non-zero',
  );

export const optionalMinsizeSchema = minsizeSchema.refine(
  (value) => !value || Number(value) >= 0,
  'Minsize should not be negative',
);

const diskPartitionFieldSchema = z.object({
  id: z.string(),
  min_size: requiredMinsizeSchema,
  unit: unitsSchema.optional(),
});

const filesystemSchemaBuilder = (
  mountpointSchema: z.ZodType<string, string>,
  requiredPartitions: ApiFilesystem[] = [],
) => {
  const filesystemPartitionSchema = z
    .object({
      id: z.string(),
      mountpoint: mountpointSchema,
      min_size: requiredMinsizeSchema,
      unit: unitsSchema,
    })
    // NOTE: we need to cross validate mountpoint minsize
    // against OpenSCAP/Compliance minsizes
    .superRefine((partition, ctx) => {
      if (requiredPartitions.length === 0) return;

      const required = requiredPartitions.find(
        (p) => p.mountpoint === partition.mountpoint,
      );

      if (
        required &&
        required.min_size > convertToBytes(partition.min_size, partition.unit)
      ) {
        const minimum = required.min_size / UNIT_GIB;
        ctx.addIssue({
          code: 'custom',
          message: `Minimum size must be at least ${minimum} GiB`,
          path: ['min_size'],
        });
      }
    });

  const filesystemPartitionListSchema = z
    .array(filesystemPartitionSchema)
    .superRefine(uniqueMountpoints());

  const filesystemSchema = z.object({
    partitions: filesystemPartitionListSchema,
  });

  const plainPartitionSchema = diskPartitionFieldSchema
    .extend({
      type: z.literal('plain'),
      label: z.string().optional(),
      part_type: z.string().optional(),
      mountpoint: mountpointSchema.optional(),
      fs_type: filesystemTypeSchema,
    })
    .superRefine((partition, ctx) => {
      if (partition.fs_type === 'swap' || partition.mountpoint) return;

      ctx.addIssue({
        code: 'custom',
        path: ['mountpoint'],
        message: 'Non-swap filesystems require a mountpoint',
      });
    });

  const logicalVolumeSchema = diskPartitionFieldSchema
    .extend({
      name: nameSchema.optional(),
      type: z.literal('lv'),
      minsize: optionalMinsizeSchema.optional(),
      mountpoint: mountpointSchema.optional(),
      label: z.string().optional(),
      fs_type: filesystemTypeSchema,
    })
    .superRefine((volume, ctx) => {
      if (volume.fs_type === 'swap' || volume.mountpoint) return;

      ctx.addIssue({
        code: 'custom',
        path: ['mountpoint'],
        message: 'Non-swap filesystems require a mountpoint',
      });
    });

  const logicalVolumeListSchema = z
    .array(logicalVolumeSchema)
    .superRefine(uniqueBy('logical volumes', 'name', (vg) => vg.name));

  const volumeGroupSchema = diskPartitionFieldSchema
    .extend({
      name: nameSchema.optional(),
      minsize: optionalMinsizeSchema.optional(),
      type: z.literal('lvm'),
      part_type: z.string().optional(),
      logical_volumes: logicalVolumeListSchema,
    })
    .superRefine((vg, ctx) => {
      if (!('logical_volumes' in vg)) return;

      for (const [index, volume] of vg.logical_volumes.entries()) {
        if (!volume.name || volume.name !== vg.name) continue;
        ctx.addIssue({
          code: 'custom',
          path: ['logical_volumes', index, 'name'],
          value: volume.name,
          params: { type: 'duplicate', value: volume.name },
          message:
            'A logical volume must have a different name from its volume group',
        });
      }
    });

  const btrfsSubvolumeSchema = z.object({
    name: nameSchema,
    mountpoint: mountpointSchema,
  });

  const btrfsSubvolumeListSchema = z
    .array(btrfsSubvolumeSchema)
    .superRefine(uniqueBy('btrfs subvolumes', 'name', (sv) => sv.name));

  const btrfsVolumeSchema = diskPartitionFieldSchema.extend({
    type: z.literal('btrfs'),
    part_type: z.string().optional(),
    minsize: optionalMinsizeSchema.optional(),
    subvolumes: btrfsSubvolumeListSchema,
  });

  const diskPartitionSchema = z.union([
    plainPartitionSchema,
    volumeGroupSchema,
    btrfsVolumeSchema,
  ]);

  const diskPartitionListSchema = z
    .array(diskPartitionSchema)
    .superRefine(uniqueMountpoints());

  const mountpointEntrySchema = z.object({
    id: z.string(),
    type: z.string().optional(),
    mountpoint: mountpointSchema.optional(),
    logical_volumes: z
      .array(
        z.object({
          id: z.string(),
          mountpoint: mountpointSchema.optional(),
        }),
      )
      .optional(),
  });

  const mountpointEntryListSchema = z
    .array(mountpointEntrySchema)
    .superRefine(uniqueMountpoints());

  const diskSchema = z.object({
    minsize: optionalMinsizeSchema.optional(),
    unit: unitsSchema,
    type: z.literal(['gpt', 'dos']).optional(),
    partitions: diskPartitionListSchema,
  });

  const basicSchema = z.object({
    mode: z.literal('basic'),
    filesystem: filesystemSchema,
    partitioningMode: partitioningModeSchema.optional(),
  });

  const advancedSchema = z.object({
    mode: z.literal('advanced'),
    disk: diskSchema,
  });

  const filesystemSliceSchema = z.discriminatedUnion('mode', [
    automaticSchema,
    basicSchema,
    advancedSchema,
  ]);

  return {
    mountpointSchema,
    mountpointEntrySchema,
    mountpointEntryListSchema,
    filesystemPartitionSchema,
    filesystemPartitionListSchema,
    filesystemSchema,
    plainPartitionSchema,
    logicalVolumeSchema,
    volumeGroupSchema,
    btrfsVolumeSchema,
    diskPartitionSchema,
    diskSchema,
    basicSchema,
    advancedSchema,
    filesystemSliceSchema,
  };
};

export const createFilesystemSchema = (
  mode: 'package' | 'image',
  requiredPartitions: ApiFilesystem[] = [],
) => {
  if (mode === 'image') {
    // image mode doesn't have OpenSCAP/Compliance customizations
    return filesystemSchemaBuilder(imageModeMountpointSchema);
  }

  return filesystemSchemaBuilder(
    packageModeMountpointSchema,
    requiredPartitions,
  );
};
