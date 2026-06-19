import { RootState } from '@/store';

export const selectComplianceProfileID = (state: RootState) => {
  return state.wizard.compliance.profileID;
};

export const selectCompliancePolicyID = (state: RootState) => {
  return state.wizard.compliance.policyID;
};

export const selectCompliancePolicyTitle = (state: RootState) => {
  return state.wizard.compliance.policyTitle;
};

export const selectComplianceType = (state: RootState) => {
  return state.wizard.compliance.type;
};

export const selectFips = (state: RootState) => {
  return state.wizard.compliance.fips;
};
