import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

const KernelStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Kernel
      </Title>
      <Text>Customize kernel name and kernel arguments.</Text>
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
