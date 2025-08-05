import React, { useEffect } from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Spinner,
} from '@patternfly/react-core';

import { useGetOscapCustomizationsQuery } from '../../../../../store/backendApi';
import { PolicyRead, usePolicyQuery } from '../../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { OpenScapProfile } from '../../../../../store/imageBuilderApi';
import {
  changeCompliance,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectDistribution,
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

  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
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
  }, [isSuccessPolicyInfo]);

  const oscapProfile = oscapProfileInfo?.openscap as OpenScapProfile;

  return (
    <>
      {(isFetchingOscapProfileInfo || isFetchingPolicyInfo) && (
        <Spinner size='lg' />
      )}
      {isSuccessOscapProfileInfo && (
        <>
          <Content component={ContentVariants.dl} className='review-step-dl'>
            <Content
              component={ContentVariants.dt}
              className='pf-v6-u-min-width'
            >
              Profile description
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
                  {(oscapProfileInfo?.packages ?? []).join(', ')}
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
                  {oscapProfileInfo?.kernel?.append}
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
                  {(oscapProfileInfo?.services?.enabled ?? []).join(' ')}
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
                  {(oscapProfileInfo?.services?.disabled ?? [])
                    .concat(oscapProfileInfo?.services?.masked ?? [])
                    .join(' ')}
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
