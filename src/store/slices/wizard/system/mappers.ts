import { createSelector } from '@reduxjs/toolkit';

import {
  FIRST_BOOT_SERVICE_DATA,
  FIRSTBOOT_PATH,
  FIRSTBOOT_SERVICE_PATH,
} from '@/constants';
import type { File } from '@/store/api/backend';

import { selectFirstBootScript } from './selectors';

// this needs to be exported because other slices
// also have file customizations
export const mapFirstbootFiles = createSelector(
  [selectFirstBootScript],
  (firstbootScript): File[] => {
    if (!firstbootScript) {
      return [];
    }

    // TODO: we really should figure out how to handle this
    // lower down in the stack rather than the frontend
    return [
      {
        path: FIRSTBOOT_SERVICE_PATH,
        data: FIRST_BOOT_SERVICE_DATA,
        data_encoding: 'base64',
        ensure_parents: true,
      },
      {
        path: FIRSTBOOT_PATH,
        data: btoa(firstbootScript),
        data_encoding: 'base64',
        mode: '0774',
        ensure_parents: true,
      },
    ];
  },
);
