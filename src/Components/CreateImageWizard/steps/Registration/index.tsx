import React from 'react';

import { Content, Form, Title, FormGroup } from '@patternfly/react-core';

import ActivationKeyInformation from './components/ActivationKeyInformation';
import ActivationKeysList from './components/ActivationKeysList';
import Registration from './components/Registration';
import SatelliteRegistration from './components/SatelliteRegistration';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectActivationKey,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const RegistrationStep = () => {
  const activationKey = useAppSelector(selectActivationKey);
  const registrationType = useAppSelector(selectRegistrationType);
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Register systems using this image
      </Title>
      <Content>
        You can either automatically register your systems with Red Hat to
        enhance security and track your spending or choose to register your
        system during initial boot.
      </Content>
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
            data-testid="selected-activation-key"
          >
            <ActivationKeyInformation />
          </FormGroup>
        )}
    </Form>
  );
};

export default RegistrationStep;
