import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import UserInfo from './components/UserInfo';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Users
      </Title>
      <Content>
        Create user accounts for systems that will use this image. Duplicate
        usernames are not allowed.
      </Content>
      <UserInfo attemptedNext={attemptedNext} />
    </Form>
  );
};

export default UsersStep;
