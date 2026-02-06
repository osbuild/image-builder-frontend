import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import ServicesInput from './components/ServicesInputs';

import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const ServicesStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Systemd services
      </Title>
      <Content>Enable, disable and mask systemd services.</Content>
      <NetworkInstallerAlert />
      <ServicesInput />
    </Form>
  );
};

export default ServicesStep;
