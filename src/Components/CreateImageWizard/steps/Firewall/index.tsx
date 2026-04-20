import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useFlag } from '@/Utilities/useGetEnvironment';

import PortsInput from './components/PortsInput';
import Services from './components/Services';

const FirewallStep = () => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='firewall' />
      <Title
        headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
        size={isWizardRevampEnabled ? 'lg' : 'xl'}
      >
        Firewall
      </Title>
      <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
        Control network traffic by configuring your image&apos;s firewall.
        Specify which ports and services are allowed to communicate with your
        system.
      </Content>
      <PortsInput />
      <Services />
    </Wrapper>
  );
};

export default FirewallStep;
