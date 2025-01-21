import React from 'react';

import { Text, Form, Title, FormGroup } from '@patternfly/react-core';

import ActivationKeyInformation from './ActivationKeyInformation';
import ActivationKeysList from './ActivationKeysList';
import Registration from './Registration';

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
      <Text>
        You can either automatically register your systems with Red Hat to
        enhance security and track your spending or choose to register your
        system during initial boot.
      </Text>
      <Registration />
      {!process.env.IS_ON_PREMISE && <ActivationKeysList />}
      {!process.env.IS_ON_PREMISE &&
        activationKey &&
        registrationType !== 'register-later' && (
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
