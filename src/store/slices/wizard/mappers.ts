// These selectors use createSelector for its declarative composition,
// not memoization. Each mapper produces a fragment of the API request
// body, composed bottom-up from slice selectors into the full
// customizations object.
import { createSelector } from '@reduxjs/toolkit';

import { mapComplianceCustomizations } from './compliance';
import { mapContentCustomizations } from './content';
import { mapFilesystemCustomizations } from './filesystem';
import {
  mapRegistrationCustomizations,
  mapSatelliteFiles,
} from './registration';
import { mapFirstbootFiles, mapSystemCustomizations } from './system';

export const mapFileCustomizations = createSelector(
  [mapSatelliteFiles, mapFirstbootFiles],
  (satellite, firstboot) => {
    if (satellite.length === 0 && firstboot.length === 0) {
      return undefined;
    }

    return { files: [...satellite, ...firstboot] };
  },
);

export const mapCustomizations = createSelector(
  [
    mapFileCustomizations,
    mapRegistrationCustomizations,
    mapContentCustomizations,
    mapComplianceCustomizations,
    mapFilesystemCustomizations,
    mapSystemCustomizations,
  ],
  (files, subscription, content, compliance, filesystem, system) => ({
    customizations: {
      // first boot & satellite use file customizations
      ...files,
      // subscription, aap_registration + cacerts
      ...subscription,
      // packages, modules, payload repos + custom repos
      ...content,
      // fips + openscap
      ...compliance,
      // disk, filesystem + partition mode
      ...filesystem,
      // users, groups, services, hostname, kernel, timezone, locale + firewall
      ...system,
    },
  }),
);
