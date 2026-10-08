export type Units = 'B' | 'MiB' | 'GiB';
export type FSType = 'ext4' | 'xfs' | 'vfat' | 'swap';
export type PartitioningMode = 'raw' | 'lvm' | 'auto-lvm';
export type FilesystemMode = 'automatic' | 'basic' | 'advanced';

export type FilesystemPartition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export type Filesystem = {
  partitions: FilesystemPartition[];
};

export type DiskPartitionBase = {
  id: string;
  min_size: string | undefined;
  unit: Units | undefined;
};

export type PlainPartitionWithBase = DiskPartitionBase & {
  type?: 'plain' | undefined;
  part_type?: string | undefined;
  minsize?: string | undefined;
  mountpoint?: string | undefined;
  label?: string | undefined;
  fs_type: FSType;
};

export type LogicalVolumeWithBase = DiskPartitionBase & {
  name?: string | undefined;
  minsize?: string | undefined;
  mountpoint?: string | undefined;
  label?: string | undefined;
  fs_type: FSType;
};

export type VolumeGroupWithExtendedLV = DiskPartitionBase & {
  type: 'lvm';
  part_type?: string | undefined;
  name?: string | undefined;
  minsize?: string | undefined;
  logical_volumes: LogicalVolumeWithBase[];
};

type BtrfsSubvolume = {
  name: string;
  mountpoint: string;
};

export type BtrfsVolume = DiskPartitionBase & {
  type: 'btrfs';
  part_type?: string | undefined;
  minsize?: string | undefined;
  subvolumes: BtrfsSubvolume[];
};

export type MountpointDiskPartition =
  PlainPartitionWithBase | LogicalVolumeWithBase;

export type DiskPartition =
  PlainPartitionWithBase | VolumeGroupWithExtendedLV | BtrfsVolume;

export type Disk = {
  minsize?: string | undefined;
  unit: Units;
  partitions: DiskPartition[];
  type?: 'gpt' | 'dos' | undefined;
};

export type MountpointPolicy = {
  Deny?: boolean;
  Exact?: boolean;
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
