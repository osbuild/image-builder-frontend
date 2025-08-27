import React, { useEffect } from 'react';

import {
  Alert,
  AlertActionLink,
  Checkbox,
  Content,
  Form,
  FormGroup,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import OscapOnPremSpinner from './components/OnPremSpinner';
import OscapOnPremWarning from './components/OnPremWarning';
import Oscap from './Oscap';
import { removeBetaFromRelease } from './removeBetaFromRelease';

import { COMPLIANCE_URL } from '../../../../constants';
import {
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
} from '../../../../store/backendApi';
import { usePoliciesQuery } from '../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeCompliance,
  changeComplianceType,
  changeDisabledServices,
  changeEnabledServices,
  changeFips,
  changeFscMode,
  changeMaskedServices,
  clearKernelAppend,
  ComplianceType,
  removePackage,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectFips,
} from '../../../../store/wizardSlice';
import { useFlag } from '../../../../Utilities/useGetEnvironment';
import { useOnPremOpenSCAPAvailable } from '../../../../Utilities/useOnPremOpenSCAP';

const OscapContent = () => {
  const dispatch = useAppDispatch();
  const { analytics } = useChrome();
  const complianceEnabled = useFlag('image-builder.compliance.enabled');
  const complianceType = useAppSelector(selectComplianceType);
  const profileID = useAppSelector(selectComplianceProfileID);
  const fips = useAppSelector(selectFips);
  const prefetchOscapProfile = useBackendPrefetch('getOscapProfiles', {});
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const majorVersion = release.split('-')[1];

  const { data: currentProfileData } = useGetOscapCustomizationsQuery(
    {
      distribution: release,
      // @ts-ignore if openScapProfile is undefined the query is going to get skipped
      profile: profileID,
    },
    { skip: !profileID },
  );

  useEffect(() => {
    prefetchOscapProfile({ distribution: release });
    // This useEffect hook should run *only* on mount and therefore has an empty
    // dependency array. eslint's exhaustive-deps rule does not support this use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFipsToggle = (checked: boolean) => {
    dispatch(changeFips(checked));
  };

  const handleTypeChange = (complianceType: string) => {
    dispatch(changeComplianceType(complianceType as ComplianceType));

    // Avoid showing profile information when switching between types by
    // clearing the compliance data.
    dispatch(
      changeCompliance({
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      }),
    );
    const pkgs = currentProfileData?.packages || [];
    for (const pkg of pkgs) {
      dispatch(removePackage(pkg));
    }
    dispatch(changeFscMode('automatic'));
    dispatch(changeEnabledServices([]));
    dispatch(changeMaskedServices([]));
    dispatch(changeDisabledServices([]));
    dispatch(clearKernelAppend());
    dispatch(changeFips(false));
  };

  if (!process.env.IS_ON_PREMISE) {
    if (complianceEnabled) {
      analytics.screen('ib-createimagewizard-step-security-compliance');
    } else {
      analytics.screen('ib-createimagewizard-step-security-openscap');
    }
  }
  const { data: policies } = usePoliciesQuery(
    {
      filter: `os_major_version=${majorVersion}`,
    },
    {
      skip: complianceType === 'openscap',
    },
  );

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        {complianceEnabled ? 'Compliance' : 'OpenSCAP profile'}
      </Title>
      <Content>
        Below you can select which Insights compliance policy or OpenSCAP
        profile your image will be compliant to. Insights compliance allows the
        use of tailored policies, whereas OpenSCAP gives you the default
        versions. This will automatically help monitor the adherence of your
        registered RHEL systems to a selected policy or profile.
      </Content>
      <FormGroup>
        <Checkbox
          id='fips-enabled-checkbox'
          label='Enable FIPS mode'
          isChecked={fips.enabled}
          onChange={(_event, checked) => handleFipsToggle(checked)}
          description='Enable FIPS 140-2 compliant cryptographic algorithms. This setting will be applied at build time and will persist on boot.'
        />
      </FormGroup>
      {complianceEnabled && (
        <ToggleGroup aria-label='Default with single selectable'>
          <ToggleGroupItem
            text='Compliance policies'
            buttonId='toggle-group-compliance'
            isSelected={complianceType === 'compliance'}
            onChange={() => handleTypeChange('compliance')}
          />
          <ToggleGroupItem
            text='OpenSCAP profiles'
            buttonId='toggle-group-openscap'
            isSelected={complianceType === 'openscap'}
            onChange={() => handleTypeChange('openscap')}
          />
        </ToggleGroup>
      )}
      {Array.isArray(policies?.data) &&
        policies.data.length === 0 &&
        complianceType === 'compliance' && (
          <Alert variant='info' isInline title='No compliance policies created'>
            <p>
              Currently there are no compliance policies in your environment. To
              help you get started, select one of the default policies below and
              we will create the policy for you. However, in order to modify the
              policy or to create a new one, you must go through Insights
              Compliance.
            </p>
            <AlertActionLink component='a' href={COMPLIANCE_URL}>
              Save blueprint and navigate to Insights Compliance
            </AlertActionLink>
          </Alert>
        )}
      <Oscap />
    </Form>
  );
};

const OnPremOscapStep = () => {
  const [onPremOpenSCAPAvailable, isLoading] = useOnPremOpenSCAPAvailable();

  if (isLoading) {
    return <OscapOnPremSpinner />;
  }

  if (!onPremOpenSCAPAvailable) {
    return <OscapOnPremWarning />;
  }

  return <OscapContent />;
};

const OscapStep = process.env.IS_ON_PREMISE ? OnPremOscapStep : OscapContent;

export default OscapStep;
