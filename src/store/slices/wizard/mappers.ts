import { createSelector } from '@reduxjs/toolkit';

import { mapSatelliteFiles } from './registration';
import { mapFirstbootFiles } from './system';

export const mapFileCustomizations = createSelector(
  [mapSatelliteFiles, mapFirstbootFiles],
  (satellite, firstboot) => {
    if (satellite.length === 0 && firstboot.length === 0) {
      return undefined;
    }

    return { files: [...satellite, ...firstboot] };
  },
);
