import React, { useEffect, useState } from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useGetUser } from '@/Hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { changeOrgId } from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import AnsibleAutomationPlatform from './components/AnsibleAutomationPlatform';
import Registration from './components/Registration';

const RegistrationStep = () => {
  const dispatch = useAppDispatch();
  const { auth } = useChrome();
  const { orgId } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const [showAlert, setShowAlert] = useState(false);

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  useEffect(() => {
    if (!isOnPremise && orgId) {
      dispatch(changeOrgId(orgId));
    }
  }, [isOnPremise, orgId, dispatch]);

  return (
    <Wrapper>
      <CustomizationLabels customization='registration' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
          id='registration-section'
        >
          Register
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Configure registration settings for systems that will use this image.
        </Content>
      </Content>
      <Registration onErrorChange={setShowAlert} />
      <AnsibleAutomationPlatform />
      {showAlert && (
        <Alert title='Activation keys unavailable' variant='danger' isInline>
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </Wrapper>
  );
};

export default RegistrationStep;
