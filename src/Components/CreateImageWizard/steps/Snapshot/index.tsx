import React from 'react';

import { Form, Content, Title } from '@patternfly/react-core';

import Snapshot from './components/Snapshot';

import ManageRepositoriesButton from '../Repositories/components/ManageRepositoriesButton';

export default function SnapshotStep() {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
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
