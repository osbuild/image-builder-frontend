import { createSelector } from '@reduxjs/toolkit';

import {
  SATELLITE_PATH,
  SATELLITE_SERVICE_DATA,
  SATELLITE_SERVICE_PATH,
} from '@/constants';
import type { File } from '@/store/api/backend';

import {
  selectRegistrationType,
  selectSatelliteRegistrationCommand,
} from './selectors';

// this needs to be exported because other slices
// also have file customizations
export const mapSatelliteFiles = createSelector(
  [selectSatelliteRegistrationCommand, selectRegistrationType],
  (satCmd, registrationType): File[] => {
    if (!satCmd || registrationType !== 'register-satellite') {
      return [];
    }

    // TODO: we really should figure out how to handle this
    // lower down in the stack rather than the frontend
    return [
      {
        path: SATELLITE_SERVICE_PATH,
        data: SATELLITE_SERVICE_DATA,
        data_encoding: 'base64',
        ensure_parents: true,
      },
      {
        path: SATELLITE_PATH,
        data: btoa(satCmd),
        mode: '0774',
        data_encoding: 'base64',
        ensure_parents: true,
      },
    ];
  },
);
