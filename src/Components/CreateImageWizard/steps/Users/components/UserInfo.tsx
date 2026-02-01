import React from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import UserRow from './UserRow';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { addUser, selectUsers } from '../../../../../store/wizardSlice';
import { useUsersValidation } from '../../../utilities/useValidation';

type UserInfoProps = {
  attemptedNext?: boolean | undefined;
};

const UserInfo = ({ attemptedNext = false }: UserInfoProps) => {
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
  const hasErrors = !!stepValidation.disabledNext;
  const showAlert = attemptedNext && hasErrors;

  const onAddUserClick = () => {
    dispatch(addUser());
  };
  return (
    <>
      {showAlert && (
        <Alert
          variant='danger'
          isInline
          title='Errors found'
          className='pf-v6-u-mt-lg'
        />
      )}
      <Table variant='compact' borders={false}>
        <Thead>
          <Tr>
            <Th width={20}>Username</Th>
            <Th width={20}>Password</Th>
            <Th width={20}>SSH key</Th>
            <Th width={20}>Groups</Th>
            <Th width={10}>Admin</Th>
            <Th width={10} aria-label='Remove user' />
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
          isDisabled={users.length === 0 || !!stepValidation.disabledNext}
        >
          Add user
        </Button>
      </Content>
    </>
  );
};

export default UserInfo;
