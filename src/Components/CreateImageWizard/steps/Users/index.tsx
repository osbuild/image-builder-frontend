import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import UserInfo from './components/UserInfo';

import { useAppSelector } from '../../../../store/hooks';
import { selectBlueprintMode } from '../../../../store/wizardSlice';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
  const blueprintMode = useAppSelector(selectBlueprintMode);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Users
      </Title>
      <Content>
        Create user accounts for systems that will use this image. Duplicate
        usernames are not allowed.
      </Content>
      {blueprintMode === 'image' && (
        <Content>
          You must create a user during the image build process to be able to
          log in.
        </Content>
      )}
      <UserInfo attemptedNext={attemptedNext} />
    </Form>
  );
};

export default UsersStep;
