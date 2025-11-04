import React from 'react';

import {
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Spinner,
} from '@patternfly/react-core';

import { useGetOscapCustomizationsQuery } from '../../../../../store/backendApi';
import { useAppSelector } from '../../../../../store/hooks';
import { OpenScapProfile } from '../../../../../store/imageBuilderApi';
import {
  selectComplianceProfileID,
  selectDistribution,
  selectFips,
} from '../../../../../store/wizardSlice';

export const OscapProfileInformation = (): JSX.Element => {
  const release = useAppSelector(selectDistribution);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);
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
      skip: !complianceProfileID,
    },
  );

  const customizationData = oscapProfileInfo;
  const profileMetadata = oscapProfileInfo;
  const isFetchingOscapData = isFetchingOscapProfileInfo;
  const isSuccessOscapData = isSuccessOscapProfileInfo;
  const hasCriticalError = profileError;
  const shouldShowData = isSuccessOscapData && !hasCriticalError;

  const oscapProfile = profileMetadata?.openscap as OpenScapProfile | undefined;

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
    </>
  );
};

export default OscapProfileInformation;
