import React from 'react';

import { Content, Form, Label, Title } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useSecuritySummary } from '@/store/api/backend';

import ServicesInput from './components/ServicesInputs';

const ServicesStep = () => {
  const { services: requiredByOpenSCAP } = useSecuritySummary();

  return (
    <Form>
      <CustomizationLabels customization='services' />
      <Title
        headingLevel='h1'
        size='xl'
        className='pf-v6-u-display-flex pf-v6-u-align-items-center'
      >
        Systemd services
        {requiredByOpenSCAP.total > 0 && (
          <Label icon={<InfoCircleIcon />} className='pf-v6-u-ml-sm'>
            {requiredByOpenSCAP.total} Added by OpenSCAP
          </Label>
        )}
      </Title>
      <Content>
        Configure systemd units to manage your system’s services and startup
        logic. Enable services to start at boot, disable them to prevent
        automatic starting, or mask them to completely block execution.
      </Content>
      <ServicesInput />
    </Form>
  );
};

export default ServicesStep;
