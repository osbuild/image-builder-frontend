import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import ServicesInput from './components/ServicesInputs';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const ServicesStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='services' />
      <Title headingLevel='h1' size='xl'>
        Systemd services
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
