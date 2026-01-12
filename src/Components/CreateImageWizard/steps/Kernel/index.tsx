import React from 'react';

import { Alert, Content, Form, Title } from '@patternfly/react-core';

import KernelArguments from './components/KernelArguments';
import KernelName from './components/KernelName';

import { useAppSelector } from '../../../../store/hooks';
import { selectImageTypes } from '../../../../store/wizardSlice';
import { NetworkInstallerAlert } from '../../../sharedComponents/NetworkInstallerAlert';

const KernelStep = () => {
  const environments = useAppSelector(selectImageTypes);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Kernel
      </Title>
      <Content>Customize kernel name and kernel arguments.</Content>
      <NetworkInstallerAlert />
      {environments.includes('wsl') && (
        <Alert
          variant='warning'
          isInline
          title='Kernel customizations are not applied to Windows Subsystem for Linux images'
        />
      )}
      <KernelName />
      <KernelArguments />
    </Form>
  );
};

export default KernelStep;
