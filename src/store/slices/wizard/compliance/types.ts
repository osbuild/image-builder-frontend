export type ComplianceType = 'none' | 'openscap' | 'compliance';

export type ComplianceSlice = {
  type: ComplianceType;
  policyID: string | undefined;
  profileID: string | undefined;
  policyTitle: string | undefined;
  fips: {
    enabled: boolean;
  };
};
