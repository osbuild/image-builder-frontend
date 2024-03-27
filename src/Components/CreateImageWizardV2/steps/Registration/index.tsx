import React from 'react';

import { Text, Form, Title, FormGroup } from '@patternfly/react-core';

import ActivationKeyInformation from './ActivationKeyInformation';
import ActivationKeysList from './ActivationKeysList';
import RegisterLaterInformation from './RegisterLaterInformation';
import Registration from './Registration';

import { useAppSelector } from '../../../../store/hooks';
import {
  selectActivationKey,
  selectRegistrationType,
} from '../../../../store/wizardSlice';

const RegistrationStep = () => {
  const registrationType = useAppSelector(selectRegistrationType);
  const activationKey = useAppSelector(selectActivationKey);
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Register systems using this image
      </Title>
      <Text>
        Automatically register your systems with Red Hat to enhance security and
        track your spending.
      </Text>
      <Registration />
      {registrationType !== 'register-later' ? (
        <>
          <ActivationKeysList />
          {activationKey && (
            <FormGroup
              isRequired={true}
              label={'Selected activation key'}
              data-testid="selected-activation-key"
            >
              <ActivationKeyInformation />
            </FormGroup>
          )}
        </>
      ) : (
        <RegisterLaterInformation />
      )}
    </Form>
  );
};

export default RegistrationStep;
