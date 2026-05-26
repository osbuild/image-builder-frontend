import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import { selectBlueprintMode } from '@/store/slices/wizard';

import UserInfo from './components/UserInfo';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return (
    <>
      <CustomizationLabels customization='users' />
      <Content>
        <Title headingLevel='h2' size='lg'>
          Users
        </Title>
        <Content component='small'>
          Create user accounts to manage access to your image. All usernames
          must be unique.
          {/* TO DO: learn more about accessing your SSH keys link */}
          {isOnPremise &&
            blueprintMode === 'image' &&
            ' You must create a user during the image build process to be able to log in.'}
        </Content>
      </Content>
      <UserInfo attemptedNext={attemptedNext} />
    </>
  );
};

export default UsersStep;
