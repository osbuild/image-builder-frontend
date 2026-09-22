import { RHEL_10, X86_64 } from '@/constants';

import { OutputSlice } from './types';

export const initialState: OutputSlice = {
  bootcDistributions: [],
  architecture: X86_64,
  distribution: RHEL_10,
  imageSourceType: 'official',
  imageTypes: [],
};
