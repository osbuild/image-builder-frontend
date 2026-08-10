import React from 'react';

import { Content, Title } from '@patternfly/react-core';

import { CustomizationLabels } from '@/Components/sharedComponents/CustomizationLabels';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

import UserInfo from './components/UserInfo';

type UsersStepProps = {
  attemptedNext?: boolean | undefined;
};

const UsersStep = ({ attemptedNext }: UsersStepProps) => {
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
          {isOnPremise && (
            <>
              {' '}
              Passwords are stored in plain text on this host. To store a hashed
              password instead, generate one with <code>
                openssl passwd -6
              </code>{' '}
              and enter the result.
            </>
          )}
        </Content>
      </Content>
      <UserInfo attemptedNext={attemptedNext} />
    </>
  );
};

export default UsersStep;
