import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import PortsInput from './components/PortsInput';
import Services from './components/Services';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const FirewallStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='firewall' />
      <Title headingLevel='h1' size='xl'>
        Firewall
      </Title>
      <Content>
        Customize firewall settings for your image. When enabling or disabling
        services, use the firewalld service name rather than systemd unit names.
      </Content>
      <PortsInput />
      <Services />
    </Form>
  );
};

export default FirewallStep;
