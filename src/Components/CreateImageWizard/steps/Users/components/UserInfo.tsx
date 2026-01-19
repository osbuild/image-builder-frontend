import React from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import UserRow from './UserRow';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { addUser, selectUsers } from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';

const UserInfo = () => {
  const dispatch = useAppDispatch();
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

  const onAddUserClick = () => {
    dispatch(addUser());
  };

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
      <Table variant='compact' borders={false}>
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Password</Th>
            <Th>SSH key</Th>
            <Th>Groups</Th>
            <Th width={10}>Admin</Th>
            <Th aria-label='Remove user' />
          </Tr>
        </Thead>
        <Tbody>
          {usersToRender.map((user, index) => (
            <UserRow
              key={index}
              user={user}
              index={index}
              userCount={users.length}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={onAddUserClick}
          icon={<AddCircleOIcon />}
          isDisabled={
            hasUserWithoutName ||
            !!stepValidation.disabledNext ||
            users.length < 1
          }
        >
          Add user
        </Button>
      </Content>
    </>
  );
};

export default UserInfo;
