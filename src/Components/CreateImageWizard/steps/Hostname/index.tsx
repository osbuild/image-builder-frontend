import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import HostnameInput from './components/HostnameInput';

import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const HostnameStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Hostname
      </Title>
      <Content>Select a hostname for your image.</Content>
      <NetworkInstallerAlert />
      <HostnameInput />
    </Form>
  );
};

export default HostnameStep;
