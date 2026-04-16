import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';

import Snapshot from './components/Snapshot';

import ManageRepositoriesButton from '../Repositories/components/ManageRepositoriesButton';

const RepeatableBuildStep = () => {
  return (
    <Form>
      <CustomizationLabels customization='repositories' />
      <Title headingLevel='h1' size='xl' id='repeatable-build-section'>
        Enable repeatable build
      </Title>
      <Content>
        Create images that can be reproduced consistently with the same package
        versions and configurations. <ManageRepositoriesButton />
      </Content>
      <Snapshot />
    </Form>
  );
};

export default RepeatableBuildStep;
