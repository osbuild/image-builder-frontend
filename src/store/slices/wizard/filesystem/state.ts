import { AdvancedFS, BasicFS, FilesystemSlice } from './types';

export const initialState: FilesystemSlice = {
  mode: 'automatic',
};

export const emptyFilesystem: BasicFS = {
  mode: 'basic',
  filesystem: {
    partitions: [],
  },
  partitioningMode: undefined,
};

export const emptyDisk: AdvancedFS = {
  mode: 'advanced',
  disk: {
    minsize: '',
    unit: 'GiB',
    partitions: [],
    type: undefined,
  },
};
