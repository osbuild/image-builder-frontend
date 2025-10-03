import React from 'react';

import { Alert } from '@patternfly/react-core';

import UserRow from './UserRow';

import { useAppSelector } from '../../../../../store/hooks';
import { selectUsers } from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';

const UserInfo = () => {
  const users = useAppSelector(selectUsers);
  const usersToRender =
    users.length === 0
      ? [
          {
            name: '',
            password: '',
            ssh_key: '',
            groups: [],
            isAdministrator: false,
            hasPassword: false,
          },
        ]
      : users;

  const stepValidation = useUsersValidation();

  const hasUserWithoutName = Object.values(stepValidation.errors).some(
    (userErrors) => userErrors.userName === 'Required value',
  );

  return (
    <>
      {hasUserWithoutName && (
        <Alert
          variant='danger'
          isInline
          title='All users need to have a username'
          className='pf-v6-u-mt-lg'
        />
      )}
      {usersToRender.map((user, index) => (
        <UserRow
          key={index}
          user={user}
          index={index}
          userCount={users.length}
          isAddButtonDisabled={
            hasUserWithoutName || !!stepValidation.disabledNext
          }
        />
      ))}
    </>
  );
};

export default UserInfo;
