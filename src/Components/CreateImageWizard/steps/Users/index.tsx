import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import EmptyUserState from './component/Empty';

const UsersStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Users
      </Title>
      <Text>Add a user to your image.</Text>
      <EmptyUserState />
    </Form>
  );
};

export default UsersStep;
