import React from 'react';

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
import {
  OpenScap,
  OpenScapCompliance,
  OpenScapProfile,
} from '../../../../../store/imageBuilderApi';
import {
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectFips,
  setCompliancePolicy,
} from '../../../../../store/wizardSlice';

export const OscapProfileInformation = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const release = useAppSelector(selectDistribution);
  const complianceType = useAppSelector(selectComplianceType);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);
  const compliancePolicyTitle = useAppSelector(selectCompliancePolicyTitle);
  const fips = useAppSelector(selectFips);

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
      skip: complianceType !== 'openscap' || !complianceProfileID,
    },
  );

  const {
    data: complianceInfo,
    isFetching: isFetchingComplianceInfo,
    isSuccess: isSuccessComplianceInfo,
    error: complianceError,
  } = useGetComplianceCustomizationsQuery(
    {
      distribution: release,
      policy: compliancePolicyID!,
    },
    {
      skip: !compliancePolicyID || !!process.env.IS_ON_PREMISE,
    },
  );

  const { data: policyInfo } = usePolicyQuery(
    {
      policyId: compliancePolicyID || '',
    },
    {
      skip: complianceType !== 'compliance' || !compliancePolicyID,
    },
  );

  if (
    complianceType === 'compliance' &&
    compliancePolicyID &&
    policyInfo?.data &&
    !compliancePolicyTitle
  ) {
    const policy = policyInfo.data as PolicyRead;
    dispatch(
      setCompliancePolicy({
        policyID: compliancePolicyID,
        policyTitle: policy.title,
      }),
    );
  }

  const customizationData =
    complianceType === 'compliance' ? complianceInfo : oscapProfileInfo;
  const profileMetadata =
    complianceType === 'compliance' ? complianceInfo : oscapProfileInfo;
  const isFetchingOscapData =
    complianceType === 'compliance'
      ? isFetchingComplianceInfo
      : isFetchingOscapProfileInfo;
  const isSuccessOscapData =
    complianceType === 'compliance'
      ? isSuccessComplianceInfo
      : isSuccessOscapProfileInfo;
  const hasCriticalError =
    complianceType === 'compliance' ? complianceError : profileError;
  const shouldShowData = isSuccessOscapData && !hasCriticalError;

  const oscap = profileMetadata?.openscap as OpenScap | undefined;
  const isProfile = (value: OpenScap | undefined): value is OpenScapProfile =>
    !!value && 'profile_id' in value;
  const isCompliance = (
    value: OpenScap | undefined,
  ): value is OpenScapCompliance => !!value && 'policy_id' in value;
  const oscapProfile = isProfile(oscap) ? oscap : undefined;
  const oscapCompliance = isCompliance(oscap) ? oscap : undefined;

  return (
    <>
      {isFetchingOscapData && <Spinner size='lg' />}
      {hasCriticalError && (
        <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
          Unable to load compliance information. Please try again.
        </Content>
      )}
      {shouldShowData && (
        <>
          <Content component={ContentVariants.dl} className='review-step-dl'>
            {oscapProfile?.profile_description && (
              <>
                <Content
                  component={ContentVariants.dt}
                  className='pf-v6-u-min-width'
                >
                  Profile description
                </Content>
                <Content component={ContentVariants.dd}>
                  {oscapProfile.profile_description}
                </Content>
              </>
            )}
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
              {oscapProfile?.profile_id || oscapCompliance?.policy_id}
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
                  {' '}
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
                    .join(' ')}{' '}
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
    </>
  );
};

export default OscapProfileInformation;
