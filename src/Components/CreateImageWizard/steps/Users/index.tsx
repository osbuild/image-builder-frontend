import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import GroupInfo from './components/GroupInfo';
import UserInfo from './components/UserInfo';

const UsersStep = () => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Users and groups
      </Title>
      <Title headingLevel='h2' size='lg'>
        Groups
      </Title>
      <Content>
        Define groups before assigning users to them. Each group will be created
        on systems using this image.
      </Content>
      <GroupInfo />
      <Title headingLevel='h2' size='lg'>
        Users
      </Title>
      <Content>
        Create user accounts for systems that will use this image. Duplicate
        usernames are not allowed.
      </Content>
      <UserInfo />
    </Form>
  );
};

export default UsersStep;
