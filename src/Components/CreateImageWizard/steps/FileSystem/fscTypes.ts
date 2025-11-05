import {
  BtrfsVolume,
  FilesystemTyped,
  LogicalVolume,
  Minsize,
} from '../../../../store/imageBuilderApi';

export type FilesystemPartition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export type Units = 'B' | 'KiB' | 'MiB' | 'GiB';

export type FSType = 'ext4' | 'xfs' | 'vfat' | 'swap';

export type FscDisk = {
  minsize: string;
  partitions: DiskPartition[];
  type?: 'gpt' | 'dos' | undefined;
};

export type DiskPartitionBase = {
  id: string;
  min_size: string | undefined;
  unit: Units | undefined;
};

export type LogicalVolumeWithBase = LogicalVolume & DiskPartitionBase;

export type VolumeGroupWithExtendedLV = DiskPartitionBase & {
  type: 'lvm';
  part_type?: string | undefined;
  name?: string | undefined;
  minsize?: Minsize | undefined;
  logical_volumes: LogicalVolumeWithBase[];
};

export type DiskPartition =
  | (FilesystemTyped & DiskPartitionBase)
  | VolumeGroupWithExtendedLV
  | (BtrfsVolume & DiskPartitionBase);
