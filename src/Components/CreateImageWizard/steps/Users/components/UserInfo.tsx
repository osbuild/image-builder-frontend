import React from 'react';

import { Alert } from '@patternfly/react-core';

import UserRow from './UserRow';

import { useAppSelector } from '../../../../../store/hooks';
import {
  selectUsers,
  UserWithAdditionalInfo,
} from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';
import { isUserDefined } from '../utilities/isUserDefined';

const UserInfo = () => {
  const users = useAppSelector(selectUsers);
  const usersToRender: UserWithAdditionalInfo[] =
    users.length === 0
      ? [
          {
            id: 'empty-user',
            name: '',
            password: '',
            ssh_key: '',
            groups: [],
            isAdministrator: false,
            hasPassword: false,
            currentGroupInput: '',
          },
        ]
      : users;

  const stepValidation = useUsersValidation();

  const hasDefinedUserWithoutName = users.some((user, index) => {
    const userErrors = stepValidation.errors[index];
    if (userErrors?.userName !== 'Required value') {
      return false;
    }
    return isUserDefined(user);
  });

  const hasBlockingErrors = users.some((user, index) => {
    const userErrors = stepValidation.errors[index];
    if (!userErrors || Object.keys(userErrors).length === 0) {
      return false;
    }

    const hasOnlyEmptyUserNameError =
      Object.keys(userErrors).length === 1 &&
      userErrors.userName === 'Required value';

    return isUserDefined(user) || !hasOnlyEmptyUserNameError;
  });

  return (
    <>
      {hasDefinedUserWithoutName && (
        <Alert
          variant='danger'
          isInline
          title='Errors found'
          className='pf-v6-u-mt-lg'
        />
      )}
      {usersToRender.map((user, index) => (
        <UserRow
          key={user.id}
          user={user}
          index={index}
          userCount={users.length}
          isAddButtonDisabled={hasBlockingErrors}
        />
      ))}
    </>
  );
};

export default UserInfo;
