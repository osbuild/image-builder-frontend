import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import HostnameInput from './components/HostnameInput';

const HostnameStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Hostname
      </Title>
      <Text>Select a hostname for your image.</Text>
      <HostnameInput />
    </Form>
  );
};

export default HostnameStep;
