import { RHEL_10, X86_64 } from '@/constants';

import { DetailsSlice } from './types';
import { generateDefaultName } from './utilities';

export const initialState: DetailsSlice = {
  mode: 'create',
  blueprint: {
    name: generateDefaultName(RHEL_10, X86_64),
    isCustomName: false,
    description: '',
    mode: 'package',
  },
};
