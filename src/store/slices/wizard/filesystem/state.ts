import { FilesystemSlice } from './types';

export const initialState: FilesystemSlice = {
  mode: 'automatic',
  disk: {
    minsize: '',
    unit: 'GiB',
    partitions: [],
    type: undefined,
  },
  fileSystem: {
    partitions: [],
  },
  partitioningMode: undefined,
};
