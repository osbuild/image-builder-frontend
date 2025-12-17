import React, { useEffect } from 'react';

import {
  Alert,
  AlertActionLink,
  Button,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  Radio,
  Switch,
  Title,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import OscapOnPremSpinner from './components/OnPremSpinner';
import OscapOnPremWarning from './components/OnPremWarning';
import PolicyDetails from './components/PolicyDetails';
import PolicySelector from './components/PolicySelector';
import OpenScapProfileDetails from './components/ProfileDetails';
import ProfileSelector from './components/ProfileSelector';
import { removeBetaFromRelease } from './removeBetaFromRelease';

import {
  AMPLITUDE_MODULE_NAME,
  COMPLIANCE_URL,
  FIRST_BOOT_SERVICE,
  OSCAP_URL,
} from '../../../../constants';
import { useGetUser } from '../../../../Hooks';
import {
  useBackendPrefetch,
  useGetOscapCustomizationsQuery,
} from '../../../../store/backendApi';
import { usePoliciesQuery } from '../../../../store/complianceApi';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeComplianceType,
  changeDisabledServices,
  changeEnabledServices,
  changeFips,
  changeFscMode,
  changeMaskedServices,
  clearKernelAppend,
  ComplianceType,
  removePackage,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectComplianceType,
  selectDistribution,
  selectFips,
  selectImageTypes,
  selectServices,
  setCompliancePolicy,
  setOscapProfile,
} from '../../../../store/wizardSlice';
import { useOnPremOpenSCAPAvailable } from '../../../../Utilities/useOnPremOpenSCAP';
import ExternalLinkButton from '../../utilities/ExternalLinkButton';

const OscapContent = () => {
  const dispatch = useAppDispatch();
  const complianceType = useAppSelector(selectComplianceType);
  const policyID = useAppSelector(selectCompliancePolicyID);
  const profileID = useAppSelector(selectComplianceProfileID);
  const fips = useAppSelector(selectFips);
  const services = useAppSelector(selectServices);
  const prefetchOscapProfile = useBackendPrefetch('getOscapProfiles', {});
  const release = removeBetaFromRelease(useAppSelector(selectDistribution));
  const majorVersion = release.split('-')[1];
  const environments = useAppSelector(selectImageTypes);

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
      setCompliancePolicy({ policyID: undefined, policyTitle: undefined }),
    );
    dispatch(setOscapProfile(undefined));

    const pkgs = currentProfileData?.packages || [];
    for (const pkg of pkgs) {
      dispatch(removePackage(pkg));
    }

    const enabledServices = services.enabled.includes(FIRST_BOOT_SERVICE)
      ? [FIRST_BOOT_SERVICE]
      : [];

    dispatch(changeFscMode('automatic'));
    dispatch(changeEnabledServices(enabledServices));
    dispatch(changeMaskedServices([]));
    dispatch(changeDisabledServices([]));
    dispatch(clearKernelAppend());
    dispatch(changeFips(false));
  };

  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  if (!process.env.IS_ON_PREMISE) {
    analytics.screen('ib-createimagewizard-step-security');
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
    <>
      <Form>
        <Title headingLevel='h1' size='xl'>
          Security
        </Title>
        <Content>
          Select which Red Hat Lightspeed compliance policy or OpenSCAP profile
          you want your image to be compliant-ready for. Red Hat Lightspeed
          compliance allows the use of tailored policies, whereas OpenSCAP
          provides default versions. This step automatically helps monitor the
          adherence of your registered RHEL systems to a selected policy or
          profile.
        </Content>
        <FormGroup>
          <Switch
            id='fips-enabled-switch'
            label='Enable FIPS mode'
            isChecked={fips.enabled}
            onChange={(_event, checked) => handleFipsToggle(checked)}
            hasCheckIcon
          />
          <FormHelperText>
            <HelperText>
              Enable FIPS 140-2 compliant cryptographic algorithms. This setting
              is applied at build time and persists on boot.
            </HelperText>
          </FormHelperText>
        </FormGroup>
        {environments.includes('wsl') && (
          <Alert
            variant='warning'
            isInline
            title='OpenSCAP profiles are not compatible with WSL images.'
          />
        )}

        <FormGroup>
          <>
            <Content className='pf-v6-u-pb-sm'>
              <Radio
                id='security-type-compliance'
                name='security-type'
                label='Use a custom compliance policy'
                isChecked={complianceType === 'compliance'}
                onChange={() => handleTypeChange('compliance')}
              />
            </Content>
            <Content className='pf-v6-u-pl-lg pf-v6-u-pb-md'>
              <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem className='pf-v6-u-w-50'>
                  <PolicySelector
                    isDisabled={complianceType !== 'compliance'}
                  />
                </FlexItem>
                <FlexItem>
                  <Popover
                    headerContent='Details'
                    bodyContent={<PolicyDetails />}
                    minWidth='30'
                  >
                    <Button
                      variant='secondary'
                      icon={<InfoCircleIcon />}
                      iconPosition='left'
                      isDisabled={complianceType !== 'compliance' || !policyID}
                    >
                      View details
                    </Button>
                  </Popover>
                </FlexItem>
              </Flex>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    <ExternalLinkButton
                      url={COMPLIANCE_URL}
                      analyticsStepId='step-oscap'
                    >
                      Manage Red Hat Lightspeed compliance
                    </ExternalLinkButton>
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </Content>
          </>
          <Content className='pf-v6-u-pb-sm'>
            <Radio
              id='security-type-openscap'
              name='security-type'
              label='Use a default OpenSCAP profile'
              isChecked={complianceType === 'openscap'}
              onChange={() => handleTypeChange('openscap')}
            />
          </Content>
          <Content className='pf-v6-u-pl-lg'>
            <Flex spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem className='pf-v6-u-w-50'>
                <ProfileSelector isDisabled={complianceType !== 'openscap'} />
              </FlexItem>
              <FlexItem>
                <Popover
                  headerContent='Details'
                  bodyContent={<OpenScapProfileDetails />}
                  minWidth='30'
                >
                  <Button
                    variant='secondary'
                    icon={<InfoCircleIcon />}
                    iconPosition='left'
                    isDisabled={complianceType !== 'openscap' || !profileID}
                  >
                    View details
                  </Button>
                </Popover>
              </FlexItem>
            </Flex>
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  <ExternalLinkButton
                    url={OSCAP_URL}
                    analyticsStepId='step-oscap'
                  >
                    Manage with OpenSCAP
                  </ExternalLinkButton>
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </Content>
        </FormGroup>

        {Array.isArray(policies?.data) &&
          policies.data.length === 0 &&
          complianceType === 'compliance' && (
            <Alert
              variant='info'
              isInline
              title='No compliance policies created'
            >
              <p>
                Currently there are no compliance policies in your environment.
                To help you get started, select one of the default policies
                below and we will create the policy for you. However, in order
                to modify the policy or to create a new one, you must go through
                Red Hat Lightspeed compliance.
              </p>
              <AlertActionLink
                component='a'
                onClick={() => {
                  if (!process.env.IS_ON_PREMISE) {
                    analytics.track(
                      `${AMPLITUDE_MODULE_NAME} - Outside link clicked`,
                      {
                        step_id: 'step-oscap',
                        account_id:
                          userData?.identity.internal?.account_id ||
                          'Not found',
                      },
                    );
                  }
                }}
                href={COMPLIANCE_URL}
              >
                Save blueprint and navigate to Red Hat Lightspeed compliance
              </AlertActionLink>
            </Alert>
          )}
      </Form>
    </>
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
