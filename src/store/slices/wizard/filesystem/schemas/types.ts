import z from 'zod';

import {
  filesystemModeSchema,
  filesystemTypeSchema,
  partitioningModeSchema,
  unitsSchema,
} from './literals';
import type {
  createFilesystemSchema,
  partitionNameEntrySchema,
  requiredMinsizeSchema,
} from './schemas';

export type Minsize = z.infer<typeof requiredMinsizeSchema>;
export type Units = z.infer<typeof unitsSchema>;
export type FilesystemType = z.infer<typeof filesystemTypeSchema>;
export type PartitioningMode = z.infer<typeof partitioningModeSchema>;
export type FilesystemMode = z.infer<typeof filesystemModeSchema>;

type Schemas = ReturnType<typeof createFilesystemSchema>;

export type PartitionNameEntry = z.infer<typeof partitionNameEntrySchema>;
export type MountpointEntry = z.infer<Schemas['mountpointEntrySchema']>;

export type FilesystemPartition = z.infer<Schemas['filesystemPartitionSchema']>;
export type Filesystem = z.infer<Schemas['filesystemSchema']>;

export type PlainPartition = z.infer<Schemas['plainPartitionSchema']>;
export type LogicalVolume = z.infer<Schemas['logicalVolumeSchema']>;
export type VolumeGroup = z.infer<Schemas['volumeGroupSchema']>;
export type BtrfsVolume = z.infer<Schemas['btrfsVolumeSchema']>;

export type Disk = z.infer<Schemas['diskSchema']>;
export type DiskPartition = z.infer<Schemas['diskPartitionSchema']>;

export type MountpointDiskPartition = PlainPartition | LogicalVolume;

export type BasicFS = z.infer<Schemas['basicSchema']>;
export type AdvancedFS = z.infer<Schemas['advancedSchema']>;

export type FilesystemSlice = z.infer<Schemas['filesystemSliceSchema']>;
