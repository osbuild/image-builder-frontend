import React from 'react';

import { Form, Title } from '@patternfly/react-core';

import AAPRegistration from './components/AAPRegistration';

const AAPStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Ansible Automation Platform
      </Title>
      <AAPRegistration />
    </Form>
  );
};

export default AAPStep;
