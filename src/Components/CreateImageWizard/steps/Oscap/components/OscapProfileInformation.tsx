import React, { useEffect } from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Spinner,
} from '@patternfly/react-core';

import {
  useGetComplianceCustomizationsQuery,
  useGetOscapCustomizationsQuery,
} from '../../../../../store/backendApi';
import { PolicyRead, usePolicyQuery } from '../../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { OpenScapProfile } from '../../../../../store/imageBuilderApi';
import {
  changeCompliance,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectFips,
} from '../../../../../store/wizardSlice';

type OscapProfileInformationOptionPropType = {
  allowChangingCompliancePolicy?: boolean;
};

export const OscapProfileInformation = ({
  allowChangingCompliancePolicy = false,
}: OscapProfileInformationOptionPropType): JSX.Element => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(selectDistribution);
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);
  const complianceType = useAppSelector(selectComplianceType);
  const fips = useAppSelector(selectFips);

  const {
    data: oscapPolicyInfo,
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

  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
    error: profileError,
  } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if complianceProfileID is undefined the query is going to get skipped, so it's safe here to ignore the linter here
      profile: complianceProfileID,
    },
    {
      skip: !complianceProfileID,
    },
  );

  const customizationData =
    compliancePolicyID && oscapPolicyInfo ? oscapPolicyInfo : oscapProfileInfo;
  const profileMetadata = oscapProfileInfo;
  const isPolicyDataLoading = compliancePolicyID
    ? isFetchingOscapPolicyInfo
    : false;
  const isFetchingOscapData = isPolicyDataLoading || isFetchingOscapProfileInfo;
  const isPolicyDataSuccess = compliancePolicyID
    ? isSuccessOscapPolicyInfo
    : true;
  const isSuccessOscapData = isPolicyDataSuccess && isSuccessOscapProfileInfo;
  const hasCriticalError = profileError || (compliancePolicyID && policyError);
  const shouldShowData = isSuccessOscapData && !hasCriticalError;

  const {
    data: policyInfo,
    isFetching: isFetchingPolicyInfo,
    isSuccess: isSuccessPolicyInfo,
  } = usePolicyQuery(
    {
      policyId: compliancePolicyID || '',
    },
    {
      skip:
        !allowChangingCompliancePolicy || complianceProfileID ? true : false,
    },
  );

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

  const oscapProfile = profileMetadata?.openscap as OpenScapProfile | undefined;

  return (
    <>
      {(isFetchingOscapData || isFetchingPolicyInfo) && <Spinner size='lg' />}
      {hasCriticalError && (
        <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
          Unable to load compliance information. Please try again.
        </Content>
      )}
      {shouldShowData && (
        <>
          <Content component={ContentVariants.dl} className='review-step-dl'>
            <Content
              component={ContentVariants.dt}
              className='pf-v6-u-min-width'
            >
              {complianceType === 'compliance'
                ? 'Policy description'
                : 'Profile description'}
            </Content>
            <Content component={ContentVariants.dd}>
              {oscapProfile?.profile_description}
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v6-u-min-width'
            >
              Reference ID
            </Content>
            <Content
              data-testid='oscap-profile-info-ref-id'
              component={ContentVariants.dd}
            >
              {oscapProfile?.profile_id}
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v6-u-min-width'
            >
              Packages
            </Content>
            <Content component={ContentVariants.dd}>
              <CodeBlock>
                <CodeBlockCode>
                  {(customizationData?.packages ?? []).join(', ')}
                </CodeBlockCode>
              </CodeBlock>
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v5-u-min-width'
            >
              Kernel arguments
            </Content>
            <Content component={ContentVariants.dd}>
              <CodeBlock>
                <CodeBlockCode>
                  {customizationData?.kernel?.append}
                </CodeBlockCode>
              </CodeBlock>
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v5-u-min-width'
            >
              Enabled services
            </Content>
            <Content component={ContentVariants.dd}>
              <CodeBlock>
                <CodeBlockCode>
                  {(customizationData?.services?.enabled ?? []).join(' ')}
                </CodeBlockCode>
              </CodeBlock>
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v5-u-min-width'
            >
              Disabled services
            </Content>
            <Content component={ContentVariants.dd}>
              <CodeBlock>
                <CodeBlockCode>
                  {(customizationData?.services?.disabled ?? [])
                    .concat(customizationData?.services?.masked ?? [])
                    .join(' ')}
                </CodeBlockCode>
              </CodeBlock>
            </Content>
            <Content
              component={ContentVariants.dt}
              className='pf-v5-u-min-width'
            >
              FIPS mode
            </Content>
            <Content component={ContentVariants.dd}>
              <CodeBlock>
                <CodeBlockCode>
                  {fips.enabled ? 'Enabled' : 'Disabled'}
                </CodeBlockCode>
              </CodeBlock>
            </Content>
          </Content>
        </>
      )}
      {isSuccessPolicyInfo && (
        <>
          <Content>
            <Content component={ContentVariants.dl} className='review-step-dl'>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Policy description:
              </Content>
              <Content component={ContentVariants.dd}>
                {policyInfo?.data?.schema?.description}
              </Content>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Business objective:
              </Content>
              <Content component={ContentVariants.dd}>
                {policyInfo?.data?.schema?.business_objective}
              </Content>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Policy type:
              </Content>
              <Content component={ContentVariants.dd}>
                {policyInfo?.data?.schema?.type}
              </Content>
              <Content
                component={ContentVariants.dt}
                className='pf-v6-u-min-width'
              >
                Reference ID:
              </Content>
              <Content component={ContentVariants.dd}>
                {policyInfo?.data?.schema?.id}
              </Content>
            </Content>
          </Content>
        </>
      )}
    </>
  );
};

export default OscapProfileInformation;
