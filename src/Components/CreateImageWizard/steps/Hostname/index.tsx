import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import HostnameInput from './components/HostnameInput';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const HostnameStep = () => {
  return (
    <Form
      onSubmit={(event) => {
        // this prevents from reloading the wizard on pressing enter
        event.preventDefault();
      }}
    >
      <CustomizationLabels customization='hostname' />
      <Title headingLevel='h1' size='xl'>
        Hostname
      </Title>
      <Content>
        Define the hostname to uniquely identify this image within your network
        environment.
      </Content>
      <HostnameInput />
    </Form>
  );
};

export default HostnameStep;
