import {
  BtrfsVolume,
  FilesystemTyped,
  VolumeGroup,
} from '../../../../store/imageBuilderApi';

export type FilesystemPartition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export type Units = 'B' | 'KiB' | 'MiB' | 'GiB';

export type FscDisk = {
  minsize: string;
  partitions: FscDiskPartition[];
  type: 'gpt' | 'dos' | undefined;
};

export type FscDiskPartitionBase = {
  id: string;
  min_size: string | undefined;
  unit: Units;
};

export type FscDiskPartition =
  | (FilesystemTyped & FscDiskPartitionBase)
  | (VolumeGroup & FscDiskPartitionBase)
  | (BtrfsVolume & FscDiskPartitionBase);
