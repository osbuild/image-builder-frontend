import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import ActivationKeyInformation from './ActivationKeyInformation';
import ActivationKeysList from './ActivationKeysList';
import RegisterLaterInformation from './RegisterLaterInformation';
import Registration from './Registration';

import { useAppSelector } from '../../../../store/hooks';
import { selectRegistrationType } from '../../../../store/wizardSlice';

const RegistrationStep = () => {
  const registrationType = useAppSelector((state) =>
    selectRegistrationType(state)
  );
  return (
    <Form>
      <Title headingLevel="h2">Register systems using this image</Title>
      <Text>
        Automatically register your systems with Red Hat to enhance security and
        track your spending.
      </Text>
      <Registration />
      {registrationType !== 'register-later' ? (
        <>
          <ActivationKeysList />
          <ActivationKeyInformation />
        </>
      ) : (
        <RegisterLaterInformation />
      )}
    </Form>
  );
};

export default RegistrationStep;
