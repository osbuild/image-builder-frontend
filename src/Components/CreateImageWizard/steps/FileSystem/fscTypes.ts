export type Partition = {
  id: string;
  mountpoint: string;
  min_size: string;
  unit: Units;
};

export type Units = 'B' | 'KiB' | 'MiB' | 'GiB';
