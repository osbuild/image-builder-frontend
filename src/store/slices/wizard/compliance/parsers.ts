import { Customizations } from '@/store/api/backend';

import { initialState } from './state';
import { isCompliancePolicy, isOpenScapProfile } from './typeguards';
import { ComplianceSlice } from './types';

import { RequestLike } from '../types';

const parsePolicyId = ({
  openscap,
}: Customizations): ComplianceSlice['policyID'] => {
  if (!openscap || !isCompliancePolicy(openscap)) {
    return initialState.policyID;
  }

  return openscap.policy_id;
};

const parseProfileId = ({
  openscap,
}: Customizations): ComplianceSlice['profileID'] => {
  if (!openscap || !isOpenScapProfile(openscap)) {
    return initialState.profileID;
  }

  return openscap.profile_id;
};

const parseType = ({ openscap }: Customizations) => {
  if (!openscap) {
    return initialState.type;
  }

  if (isCompliancePolicy(openscap)) {
    return 'compliance';
  }

  if (isOpenScapProfile(openscap)) {
    return 'openscap';
  }

  // this shouldn't be possible but
  // it's best to be defensive
  return initialState.type;
};

const parseFips = ({ fips }: Customizations): ComplianceSlice['fips'] => {
  if (!fips || !fips.enabled) {
    return initialState.fips;
  }

  return {
    enabled: fips.enabled,
  };
};

export const parseComplianceFromRequest = ({
  customizations,
}: RequestLike): ComplianceSlice => ({
  type: parseType(customizations),
  profileID: parseProfileId(customizations),
  policyID: parsePolicyId(customizations),
  policyTitle: undefined, // there is no way of getting this from the request object
  fips: parseFips(customizations),
});
