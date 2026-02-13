import React from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import GroupInfo from './components/GroupInfo';
import UserInfo from './components/UserInfo';

import { useAppSelector } from '../../../../store/hooks';
import { selectBlueprintMode } from '../../../../store/wizardSlice';
import { CustomizationLabels } from '../../../sharedComponents/CustomizationLabels';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
  const blueprintMode = useAppSelector(selectBlueprintMode);

  return (
    <Form>
      <CustomizationLabels customization='users' />
      <Title headingLevel='h1' size='xl'>
        Groups and users
      </Title>
      <Title headingLevel='h2' size='lg'>
        Groups
      </Title>
      <Content>
        Define groups before assigning users to them. Each group will be created
        on systems using this image. Each group will automatically be assigned
        an ID number.
      </Content>
      <GroupInfo attemptedNext={attemptedNext} />
      <Title headingLevel='h2' size='lg'>
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
