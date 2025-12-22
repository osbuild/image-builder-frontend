import React, { useEffect } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import {
  GroupInputProvider,
  useGroupInputContext,
} from './components/GroupInputContext';
import UserInfo from './components/UserInfo';

type UsersStepProps = {
  onFlushReady?: ((flushFn: () => void) => void) | undefined;
};

const UsersStepContent = ({ onFlushReady }: UsersStepProps) => {
  const { flushAllInputs } = useGroupInputContext();

  useEffect(() => {
    onFlushReady?.(flushAllInputs);
  }, [onFlushReady, flushAllInputs]);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
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

const UsersStep = ({ onFlushReady }: UsersStepProps) => {
  return (
    <GroupInputProvider>
      <UsersStepContent onFlushReady={onFlushReady} />
    </GroupInputProvider>
  );
};

export default UsersStep;
