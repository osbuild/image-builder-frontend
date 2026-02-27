import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const KernelStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='kernel' />
      <Title headingLevel='h1' size='xl'>
        Kernel
      </Title>
      <Content>Customize kernel name and kernel arguments.</Content>
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
