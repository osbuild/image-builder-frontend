import React from 'react';

import { Form, Text, Title } from '@patternfly/react-core';

import EmptyUserState from './component/Empty';
import UserInfo from './component/UserInfo';

import { useAppSelector } from '../../../../store/hooks';
import { selectUsers } from '../../../../store/wizardSlice';

const UsersStep = () => {
  const users = useAppSelector(selectUsers);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Users
      </Title>
      <Text>Add a user to your image.</Text>
      {users.length !== 0 ? <UserInfo /> : <EmptyUserState />}
    </Form>
  );
};

export default UsersStep;
