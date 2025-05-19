import React from 'react';

import { Form, Content, Title } from '@patternfly/react-core';

import EmptyUserState from './components/EmptyUserState';
import UserInfo from './components/UserInfo';

import { useAppSelector } from '../../../../store/hooks';
import { selectUsers } from '../../../../store/wizardSlice';

const UsersStep = () => {
  const users = useAppSelector(selectUsers);

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Users
      </Title>
      <Content component="p">Add a user to your image.</Content>
      {users.length !== 0 ? <UserInfo /> : <EmptyUserState />}
    </Form>
  );
};

export default UsersStep;
