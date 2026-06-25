import { createSelector } from '@reduxjs/toolkit';

import {
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectComplianceType,
  selectFips,
} from './selectors';

const mapOpenscap = createSelector(
  [selectComplianceType, selectComplianceProfileID, selectCompliancePolicyID],
  (mode, profile, policy) => {
    if (mode === 'openscap' && profile) {
      return { openscap: { profile_id: profile } };
    }

    if (mode === 'compliance' && policy) {
      return { openscap: { policy_id: policy } };
    }

    return undefined;
  },
);

const mapFips = createSelector([selectFips], (fips) => {
  if (!fips.enabled) {
    return undefined;
  }

  return {
    fips: {
      enabled: fips.enabled,
    },
  };
});

export const mapComplianceCustomizations = createSelector(
  [mapOpenscap, mapFips],
  (oscap, fips) => ({ ...oscap, ...fips }),
);
