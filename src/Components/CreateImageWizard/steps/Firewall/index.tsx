import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import PortsInput from './components/PortsInput';
import Services from './components/Services';

const FirewallStep = () => {
  return (
    <>
      <CustomizationLabels customization='firewall' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Firewall
        </Title>
        <Content component='small'>
          Control network traffic by configuring your image&apos;s firewall.
          Specify which ports and services are allowed to communicate with your
          system.
        </Content>
      </Content>
      <PortsInput />
      <Services />
    </>
  );
};

export default FirewallStep;
