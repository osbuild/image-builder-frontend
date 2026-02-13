import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import HostnameInput from './components/HostnameInput';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const HostnameStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='hostname' />
      <Title headingLevel='h1' size='xl'>
        Hostname
      </Title>
      <Content>Define a hostname for your image.</Content>
      <HostnameInput />
    </Form>
  );
};

export default HostnameStep;
