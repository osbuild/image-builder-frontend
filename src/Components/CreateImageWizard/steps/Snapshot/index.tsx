import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import Snapshot from './components/Snapshot';

import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';
import ManageRepositoriesButton from '../Repositories/components/ManageRepositoriesButton';

export default function SnapshotStep() {
  return (
    <Form>
      <CustomizationLabels customization='repositories' />
      <Title headingLevel='h1' size='xl'>
        Repeatable build
      </Title>
      <Content>
        Control the consistency of the packages in the repository used to build
        the image.
        <Content>
          <ManageRepositoriesButton />
        </Content>
      </Content>
      <Snapshot />
    </Form>
  );
}
