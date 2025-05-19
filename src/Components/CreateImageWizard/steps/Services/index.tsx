import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import ServicesInput from './components/ServicesInputs';

const ServicesStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Systemd services
      </Title>
      <Content>Enable, disable and mask systemd services.</Content>
      <ServicesInput />
    </Form>
  );
};

export default ServicesStep;
