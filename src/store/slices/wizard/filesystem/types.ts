import {
  BtrfsVolume,
  FilesystemTyped,
  LogicalVolume,
  Minsize,
} from '@/store/api/backend';

export type PartitioningCustomization = 'disk' | 'filesystem';

export type PartitioningMode = 'raw' | 'lvm' | 'auto-lvm';

export type FilesystemMode = 'automatic' | 'basic' | 'advanced';
export type FilesystemPartition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export type Units = 'B' | 'MiB' | 'GiB';

export type FSType = 'ext4' | 'xfs' | 'vfat' | 'swap';

export type Disk = {
  minsize?: string | undefined;
  unit: Units;
  partitions: DiskPartition[];
  type?: 'gpt' | 'dos' | undefined;
};

export type DiskPartitionBase = {
  id: string;
  min_size: string | undefined;
  unit: Units | undefined;
};

export type PlainPartitionWithBase = FilesystemTyped & DiskPartitionBase;

export type LogicalVolumeWithBase = LogicalVolume & DiskPartitionBase;

export type VolumeGroupWithExtendedLV = DiskPartitionBase & {
  type: 'lvm';
  part_type?: string | undefined;
  name?: string | undefined;
  minsize?: Minsize | undefined;
  logical_volumes: LogicalVolumeWithBase[];
};

export type DiskPartition =
  | PlainPartitionWithBase
  | VolumeGroupWithExtendedLV
  | (BtrfsVolume & DiskPartitionBase);

export type MountpointPolicyType = {
  Deny?: boolean;
  Exact?: boolean;
};

export type MountpointPoliciesType = {
  [mountpoint: string]: MountpointPolicyType;
};

export type Filesystem = {
  partitions: FilesystemPartition[];
};

export type AutomaticFS = {
  mode: 'automatic';
};

export type BasicFS = {
  mode: 'basic';
  filesystem: Filesystem;
  partitioningMode?: PartitioningMode | undefined;
};

export type AdvancedFS = {
  mode: 'advanced';
  disk: Disk;
};

export type FilesystemSlice = AutomaticFS | BasicFS | AdvancedFS;
