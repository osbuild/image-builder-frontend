import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import HostnameInput from './components/HostnameInput';

const HostnameStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Hostname
      </Title>
      <Content>Select a hostname for your image.</Content>
      <HostnameInput />
    </Form>
  );
};

export default HostnameStep;
