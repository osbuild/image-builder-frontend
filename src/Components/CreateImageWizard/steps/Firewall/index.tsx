import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import PortsInput from './components/PortsInput';
import Services from './components/Services';

const FirewallStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Firewall
      </Title>
      <Content>Customize firewall settings for your image.</Content>
      <PortsInput />
      <Services />
    </Form>
  );
};

export default FirewallStep;
