import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import PortsInput from './components/PortsInput';

const FirewallStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Firewall
      </Title>
      <Text>Customize firewall settings for your image.</Text>
      <PortsInput />
    </Form>
  );
};

export default FirewallStep;
