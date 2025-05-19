import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

const KernelStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Kernel
      </Title>
      <Content component="p">
        Customize kernel name and kernel arguments.
      </Content>
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
