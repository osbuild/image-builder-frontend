import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import Snapshot from './components/Snapshot';

import ManageRepositoriesButton from '../Repositories/components/ManageRepositoriesButton';

const RepeatableBuildStep = () => {
  return (
    <>
      <CustomizationLabels customization='repositories' />
      <Content>
        <Title headingLevel='h2' size='lg' id='repeatable-build-section'>
          Repeatable build
        </Title>
        <Content component='small'>
          Create images that can be reproduced consistently with the same
          package versions and configurations. <ManageRepositoriesButton />
        </Content>
      </Content>
      <Snapshot />
    </>
  );
};

export default RepeatableBuildStep;
