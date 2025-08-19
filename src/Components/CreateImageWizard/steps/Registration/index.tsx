import React from 'react';

import {
  ClipboardCopy,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Title,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import ActivationKeyInformation from './components/ActivationKeyInformation';
import ActivationKeysList from './components/ActivationKeysList';
import Registration from './components/Registration';
import SatelliteRegistration from './components/SatelliteRegistration';

import { useGetUser } from '../../../../Hooks';
import { useAppSelector } from '../../../../store/hooks';
import {
  selectActivationKey,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const RegistrationStep = () => {
  const { auth } = useChrome();
  const { orgId } = useGetUser(auth);

  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Register systems using this image
      </Title>
      <FormGroup label='Organization ID'>
        <ClipboardCopy
          hoverTip='Copy to clipboard'
          clickTip='Successfully copied to clipboard!'
          variant='inline-compact'
        >
          {orgId || ''}
        </ClipboardCopy>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              If using an activation key with command line registration, you
              must provide your organization&apos;s ID
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
      <Registration />
      {registrationType === 'register-satellite' && <SatelliteRegistration />}
      {!process.env.IS_ON_PREMISE &&
        registrationType !== 'register-satellite' && <ActivationKeysList />}
      {!process.env.IS_ON_PREMISE &&
        activationKey &&
        registrationType !== 'register-later' &&
        registrationType !== 'register-satellite' && (
          <FormGroup
            label={'Selected activation key'}
            data-testid='selected-activation-key'
          >
            <ActivationKeyInformation />
          </FormGroup>
        )}
    </Form>
  );
};

export default RegistrationStep;
