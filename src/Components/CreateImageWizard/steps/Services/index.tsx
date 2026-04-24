import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';
import { useFlag } from '@/Utilities/useGetEnvironment';

import ServicesInput from './components/ServicesInputs';

const ServicesStep = () => {
  const { services: requiredByOpenSCAP } = useSecuritySummary();
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  return (
    <Wrapper>
      <CustomizationLabels customization='services' />
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
          className='pf-v6-u-display-flex pf-v6-u-align-items-center'
        >
          Systemd services
          {requiredByOpenSCAP.total > 0 && (
            <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
              {requiredByOpenSCAP.total} Added by OpenSCAP
            </Label>
          )}
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Configure systemd units to manage your system’s services and startup
          logic. Enable services to start at boot, disable them to prevent
          automatic starting, or mask them to completely block execution.
        </Content>
      </Content>
      <ServicesInput />
    </Wrapper>
  );
};

export default ServicesStep;
