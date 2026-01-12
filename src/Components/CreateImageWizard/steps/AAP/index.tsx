import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import AAPRegistration from './components/AAPRegistration';

import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const AAPStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Ansible Automation Platform
      </Title>
      <Content>
        Configure the image with an AAP callback that will run on first boot.
      </Content>
      <NetworkInstallerAlert />
      <AAPRegistration />
    </Form>
  );
};

export default AAPStep;
