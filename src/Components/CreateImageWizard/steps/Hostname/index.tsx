import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import HostnameInput from './components/HostnameInput';

const HostnameStep = () => {
  return (
    <>
      <CustomizationLabels customization='hostname' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Hostname
        </Title>
        <Content component='small'>
          Define the hostname to uniquely identify this system within your
          network environment.
        </Content>
      </Content>
      <HostnameInput />
    </>
  );
};

export default HostnameStep;
