import React, { useEffect, useState } from 'react';

import {
  Alert,
  ClipboardCopy,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';
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
        <Content
          component={isWizardRevampEnabled ? 'small' : 'p'}
          className='pf-v6-u-pb-md'
        >
          Configure registration settings for systems that will use this image.
        </Content>
        <Content className='pf-v6-u-pb-md'>
          {!isOnPremise && (
            <FormGroup label='Organization ID'>
              <ClipboardCopy
                hoverTip='Copy to clipboard'
                clickTip='Successfully copied to clipboard!'
                isReadOnly
                className='pf-v6-u-w-25'
              >
                {orgId || ''}
              </ClipboardCopy>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    If you&apos;re using an activation key with command line
                    registration, you must provide your organization&apos;s ID.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}
        </Content>
        <Content className='pf-v6-u-pb-md'>
          <Registration onErrorChange={setShowAlert} />
        </Content>
        <Content>
          <AnsibleAutomationPlatform />
        </Content>
      </Content>
      {showAlert && (
        <Alert title='Activation keys unavailable' variant='danger' isInline>
          Activation keys cannot be reached, try again later.
        </Alert>
      )}
    </Wrapper>
  );
};

export default RegistrationStep;
