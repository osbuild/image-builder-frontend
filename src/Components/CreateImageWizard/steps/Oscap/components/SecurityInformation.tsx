import React from 'react';

import {
  Content,
  ContentVariants,
  Icon,
  Label,
  LabelGroup,
  Spinner,
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesCircleIcon } from '@patternfly/react-icons';

import { useIsOnPremise } from '../../../../../Hooks';
import {
  useGetComplianceCustomizationsQuery,
  useGetOscapCustomizationsQuery,
} from '../../../../../store/backendApi';
import { useAppSelector } from '../../../../../store/hooks';
import {
  DistributionProfileItem,
  OpenScapProfile,
} from '../../../../../store/imageBuilderApi';
import {
  selectCompliancePolicyID,
  selectCompliancePolicyTitle,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectFips,
} from '../../../../../store/wizardSlice';

export const SecurityInformation = (): JSX.Element => {
  const release = useAppSelector(selectDistribution);
  const complianceType = useAppSelector(selectComplianceType);
  const complianceProfileID = useAppSelector(selectComplianceProfileID);
  const compliancePolicyID = useAppSelector(selectCompliancePolicyID);
  const compliancePolicyTitle = useAppSelector(selectCompliancePolicyTitle);
  const fips = useAppSelector(selectFips);
  const isOnPremise = useIsOnPremise();

  const {
    data: oscapProfileInfo,
    isFetching: isFetchingOscapProfileInfo,
    isSuccess: isSuccessOscapProfileInfo,
    error: profileError,
  } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      profile: complianceProfileID as unknown as DistributionProfileItem,
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
      skip: !compliancePolicyID || isOnPremise,
    },
  );

  const customizations =
    complianceType === 'compliance' ? complianceInfo : oscapProfileInfo;
  const isFetchingData =
    complianceType === 'compliance'
      ? isFetchingComplianceInfo
      : isFetchingOscapProfileInfo;
  const isSuccessData =
    complianceType === 'compliance'
      ? isSuccessComplianceInfo
      : isSuccessOscapProfileInfo;
  const hasCriticalError =
    complianceType === 'compliance' ? complianceError : profileError;
  const shouldShowData = isSuccessData && !hasCriticalError;

  const profileName =
    (customizations?.openscap as OpenScapProfile | undefined)?.profile_name ??
    (customizations?.openscap as OpenScapProfile | undefined)?.profile_id;
  const policyTitleToShow = compliancePolicyTitle;
  const packagesCount = customizations?.packages?.length ?? 0;
  const servicesCount =
    (customizations?.services?.enabled?.length ?? 0) +
    (customizations?.services?.disabled?.length ?? 0) +
    (customizations?.services?.masked?.length ?? 0);

  return (
    <>
      {isFetchingData && <Spinner size='lg' />}
      {hasCriticalError && (
        <Content component={ContentVariants.p} className='pf-v6-u-color-200'>
          Unable to load compliance information. Please try again.
        </Content>
      )}
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          FIPS mode
        </Content>
        <Content component={ContentVariants.dd}>
          {fips.enabled ? (
            <>
              <Icon status='success' isInline>
                <CheckCircleIcon />
              </Icon>{' '}
              Enabled
            </>
          ) : (
            <>
              <Icon status='danger' isInline>
                <TimesCircleIcon />
              </Icon>{' '}
              Disabled
            </>
          )}
        </Content>
      </Content>
      {shouldShowData && (
        <>
          <Content component={ContentVariants.dl} className='review-step-dl'>
            {complianceType === 'openscap' && (
              <>
                <Content
                  component={ContentVariants.dt}
                  className='pf-v6-u-min-width'
                >
                  OpenSCAP profile
                </Content>
                <Content component={ContentVariants.dd}>{profileName}</Content>
              </>
            )}
            {complianceType === 'compliance' && (
              <>
                <Content
                  component={ContentVariants.dt}
                  className='pf-v6-u-min-width'
                >
                  Compliance policy
                </Content>
                <Content component={ContentVariants.dd}>
                  {policyTitleToShow}
                </Content>
              </>
            )}
          </Content>
          <Content component={ContentVariants.dl} className='review-step-dl'>
            <Content
              component={ContentVariants.dt}
              className='pf-v6-u-min-width'
            >
              Added items
            </Content>
            <Content component={ContentVariants.dd}>
              <LabelGroup>
                <Label>{packagesCount} packages</Label>
                <Label>{servicesCount} services</Label>
              </LabelGroup>
            </Content>
          </Content>
        </>
      )}
    </>
  );
};

export default SecurityInformation;
