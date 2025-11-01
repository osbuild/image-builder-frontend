import React, { useEffect } from 'react';

import {
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Spinner,
} from '@patternfly/react-core';

import { useGetComplianceCustomizationsQuery } from '../../../../../store/backendApi';
import { PolicyRead, usePolicyQuery } from '../../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeCompliance,
  selectCompliancePolicyID,
  selectDistribution,
} from '../../../../../store/wizardSlice';

const PolicyDetails = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(selectDistribution);
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);

  const {
    isFetching: isFetchingOscapPolicyInfo,
    isSuccess: isSuccessOscapPolicyInfo,
    error: policyError,
  } = useGetComplianceCustomizationsQuery(
    {
      distribution: release,
      policy: compliancePolicyID!,
    },
    {
      skip: !compliancePolicyID || !!process.env.IS_ON_PREMISE,
    },
  );

  const isPolicyDataLoading = compliancePolicyID
    ? isFetchingOscapPolicyInfo
    : false;
  const isPolicyDataSuccess = compliancePolicyID
    ? isSuccessOscapPolicyInfo
    : true;
  const isSuccessOscapData = isPolicyDataSuccess;
  const hasCriticalError = compliancePolicyID && policyError;
  const shouldShowData = isSuccessOscapData && !hasCriticalError;

  const { data: policyInfo, isSuccess: isSuccessPolicyInfo } = usePolicyQuery({
    policyId: compliancePolicyID || '',
  });

  useEffect(() => {
    if (!policyInfo || policyInfo.data === undefined) {
      return;
    }
    const pol = policyInfo.data as PolicyRead;
    dispatch(
      changeCompliance({
        policyID: pol.id,
        profileID: pol.ref_id,
        policyTitle: pol.title,
      }),
    );
  }, [isSuccessPolicyInfo, dispatch, policyInfo]);

  return (
    <>
      {isPolicyDataLoading && <Spinner size='lg' />}
      {shouldShowData && (
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy type</DescriptionListTerm>
            <DescriptionListDescription>
              {policyInfo?.data?.schema?.type || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Policy description</DescriptionListTerm>
            <DescriptionListDescription>
              {policyInfo?.data?.schema?.description || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Business objective</DescriptionListTerm>
            <DescriptionListDescription>
              {policyInfo?.data?.schema?.business_objective || '—'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Compliance threshold</DescriptionListTerm>
            <DescriptionListDescription>
              {policyInfo?.data?.schema?.compliance_threshold || '—'}
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
