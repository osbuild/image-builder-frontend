import React, { useEffect } from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Spinner,
  Content,
  ContentVariants,
} from '@patternfly/react-core';

import { RELEASES } from '../../../../../constants';
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
import { useFlag } from '../../../../../Utilities/useGetEnvironment';

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

  const isKernelEnabled = useFlag('image-builder.kernel.enabled');
  const isServicesStepEnabled = useFlag('image-builder.services.enabled');

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
    }
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
    }
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
      })
    );
  }, [isSuccessPolicyInfo]);

  const enabledServicesDisplayString =
    oscapProfileInfo?.services?.enabled?.join(' ');
  const disabledAndMaskedServices = [
    ...(oscapProfileInfo?.services?.disabled ?? []),
    ...(oscapProfileInfo?.services?.masked ?? []),
  ];
  const disabledAndMaskedServicesDisplayString =
    disabledAndMaskedServices.join(' ');

  const oscapProfile = oscapProfileInfo?.openscap as OpenScapProfile;

  return (
    <>
      {(isFetchingOscapProfileInfo || isFetchingPolicyInfo) && (
        <Spinner size="lg" />
      )}
      {isSuccessOscapProfileInfo && (
        <>
          <Content>
            <Content component={ContentVariants.dl}>
              <Content
                component={ContentVariants.dt}
                className="pf-v6-u-min-width"
              >
                Profile description:
              </Content>
              <Content component={ContentVariants.dd}>
                {oscapProfile?.profile_description}
              </Content>
              <Content
                component={ContentVariants.dt}
                className="pf-v6-u-min-width"
              >
                Operating system:
              </Content>
              <Content component={ContentVariants.dd}>
                {RELEASES.get(release)}
              </Content>
              <Content
                component={ContentVariants.dt}
                className="pf-v6-u-min-width"
              >
                Reference ID:
              </Content>
              <Content
                data-testid="oscap-profile-info-ref-id"
                component={ContentVariants.dd}
              >
                {oscapProfile?.profile_id}
              </Content>
              {!isKernelEnabled && (
                <>
                  <Content
                    component={ContentVariants.dt}
                    className="pf-v6-u-min-width"
                  >
                    Kernel arguments:
                  </Content>
                  <Content component={ContentVariants.dd}>
                    <CodeBlock>
                      <CodeBlockCode>
                        {oscapProfileInfo?.kernel?.append}
                      </CodeBlockCode>
                    </CodeBlock>
                  </Content>
                </>
              )}
              {!isServicesStepEnabled && (
                <>
                  <Content
                    component={ContentVariants.dt}
                    className="pf-v6-u-min-width"
                  >
                    Disabled services:
                  </Content>
                  <Content component={ContentVariants.dd}>
                    <CodeBlock>
                      <CodeBlockCode>
                        {disabledAndMaskedServicesDisplayString}
                      </CodeBlockCode>
                    </CodeBlock>
                  </Content>
                  <Content
                    component={ContentVariants.dt}
                    className="pf-v6-u-min-width"
                  >
                    Enabled services:
                  </Content>
                  <Content component={ContentVariants.dd}>
                    <CodeBlock>
                      <CodeBlockCode>
                        {enabledServicesDisplayString}
                      </CodeBlockCode>
                    </CodeBlock>
                  </Content>
                </>
              )}
            </Content>
          </Content>
        </>
      )}
    </>
  );
};

export default OscapProfileInformation;
