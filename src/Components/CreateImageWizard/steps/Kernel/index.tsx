import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectFips } from '@/store/wizardSlice';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

const KernelStep = () => {
  const fips = useAppSelector(selectFips);

  return (
    <Form>
      <CustomizationLabels customization='kernel' />
      <Title headingLevel='h1' size='xl'>
        Kernel
      </Title>
      <Content>
        Choose a kernel package and append specific boot parameters to customize
        how your image initializes its core operating environment.
      </Content>
      {fips.enabled && (
        <Alert
          title='Kernel will be configured to use FIPS, no additional configuration needed.'
          variant='info'
          isInline
        />
      )}
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
