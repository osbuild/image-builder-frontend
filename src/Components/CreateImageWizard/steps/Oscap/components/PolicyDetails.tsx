import React from 'react';

import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';

import { PolicyRead, usePolicyQuery } from '../../../../../store/complianceApi';
import { useAppSelector } from '../../../../../store/hooks';
import { selectCompliancePolicyID } from '../../../../../store/wizardSlice';

const PolicyDetails = (): JSX.Element => {
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);

  const {
    data: policyInfo,
    isFetching: isFetchingPolicyInfo,
    isSuccess: isSuccessPolicyInfo,
    error: policyError,
  } = usePolicyQuery(
    {
      policyId: compliancePolicyID || '',
    },
    {
      skip: !compliancePolicyID,
    },
  );

  const isPolicyDataLoading = !!compliancePolicyID && isFetchingPolicyInfo;
  const shouldShowData =
    !!compliancePolicyID && isSuccessPolicyInfo && !policyError;
  const hasCriticalError = !!compliancePolicyID && !!policyError;

  const policy = policyInfo?.data as PolicyRead | undefined;

  return (
    <>
      {isPolicyDataLoading && <Spinner size='lg' />}
      {shouldShowData && (
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy type</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.type ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy description</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.description ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Business objective</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.business_objective ?? '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Compliance threshold</DescriptionListTerm>
            <DescriptionListDescription>
              {policy?.compliance_threshold !== undefined
                ? `${policy.compliance_threshold}%`
                : '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      )}
      {hasCriticalError && (
        <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
          Unable to load compliance information. Please try again.
        </Content>
      )}
    </>
  );
};

export default PolicyDetails;
