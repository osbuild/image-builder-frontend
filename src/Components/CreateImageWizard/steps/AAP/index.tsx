import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import AAPRegistration from './components/AAPRegistration';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const AAPStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='aap' />
      <Title headingLevel='h1' size='xl'>
        Ansible Automation Platform
      </Title>
      <Content>
        Configure the image with an AAP callback that will run on first boot.
      </Content>
      <AAPRegistration />
    </Form>
  );
};

export default AAPStep;
