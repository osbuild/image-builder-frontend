import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import ServicesInput from './components/ServicesInputs';

const ServicesStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Systemd services
      </Title>
      <Text>Enable and disable systemd services.</Text>
      <ServicesInput />
    </Form>
  );
};

export default ServicesStep;
