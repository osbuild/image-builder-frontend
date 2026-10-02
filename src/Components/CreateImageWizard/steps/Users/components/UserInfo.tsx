import React, { useCallback, useState } from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removeUser,
  selectUserGroups,
  selectUsers,
  upsertUser,
  User,
  validateUserList,
} from '@/store/slices/wizard';

import RemoveUserModal from './RemoveUserModal';
import UserRow from './UserRow';

type UserInfoProps = {
  attemptedNext?: boolean | undefined;
};

type ActiveUser = {
  index: number;
  user: User;
};

const UserInfo = ({ attemptedNext = false }: UserInfoProps) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const groups = useAppSelector(selectUserGroups);
  const [showEmptyUser, setShowEmptyUser] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | undefined>(
    undefined,
  );

  const shouldShowEmptyUser = showEmptyUser || users.length === 0;
  const displayUsers = shouldShowEmptyUser ? [...users, undefined] : users;

  const { errors } = validateUserList(users, groups);
  const showAlert = attemptedNext && errors.length > 0;

  const handleUserValidation = useCallback(
    (index: number, candidate: User) => {
      if (index < users.length) {
        const updatedUsers = [...users];
        updatedUsers[index] = candidate;
        return validateUserList(updatedUsers, groups);
      }

      return validateUserList([...users, candidate], groups);
    },
    [users, groups],
  );

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
      <RemoveUserModal
        isOpen={activeUser !== undefined}
        userName={activeUser?.user.name ?? ''}
        onClose={() => setActiveUser(undefined)}
        onRemove={() => {
          if (activeUser) {
            dispatch(removeUser(activeUser.index));
          }
          setActiveUser(undefined);
        }}
      />
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
          {displayUsers.map((user, index) => (
            <UserRow
              key={index}
              user={user}
              index={index}
              isRemoveDisabled={users.length === 0}
              validator={(candidate) => handleUserValidation(index, candidate)}
              onUpdate={(user) => {
                if (!user) return;

                if (index < users.length) {
                  dispatch(upsertUser({ index, user }));
                  return;
                }

                if (typeof user.name !== 'string' || !user.name.trim()) {
                  return;
                }

                dispatch(
                  upsertUser({
                    user: {
                      name: user.name,
                      ...(user.password && { password: user.password }),
                      ...(user.ssh_key && { ssh_key: user.ssh_key }),
                      groups: user.groups ?? [],
                      hasPassword: user.hasPassword ?? false,
                    },
                  }),
                );
                setShowEmptyUser(false);
              }}
              onRemove={() => {
                if (index < users.length && user) {
                  setActiveUser({ index, user });
                  return;
                }

                setShowEmptyUser(false);
              }}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={() => setShowEmptyUser(true)}
          icon={<AddCircleOIcon />}
          isDisabled={errors.length > 0 || shouldShowEmptyUser}
        >
          Add user
        </Button>
      </Content>
    </>
  );
};

export default UserInfo;
