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
      <Content>
        Customize firewall settings for your image. When enabling or disabling
        services, use the firewalld service name rather than systemd unit names.
      </Content>
      <PortsInput />
      <Services />
    </Wrapper>
  );
};

export default FirewallStep;
