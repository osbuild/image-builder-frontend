import { ComplianceSlice } from './types';

export const initialState: ComplianceSlice = {
  type: 'none',
  policyID: undefined,
  profileID: undefined,
  policyTitle: undefined,
  fips: {
    enabled: false,
  },
};
