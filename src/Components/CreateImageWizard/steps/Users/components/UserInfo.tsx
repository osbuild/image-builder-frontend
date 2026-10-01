import React, { useState } from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useUsersValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  removeUser,
  selectUsers,
  upsertUser,
  User,
} from '@/store/slices/wizard';

import { emptyUser } from './constants';
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
  const [showEmptyUser, setShowEmptyUser] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | undefined>(
    undefined,
  );

  const shouldShowEmptyUser = showEmptyUser || users.length === 0;
  const displayUsers = shouldShowEmptyUser ? [...users, undefined] : users;

  const stepValidation = useUsersValidation();
  const hasErrors = !!stepValidation.disabledNext;
  const showAlert = attemptedNext && hasErrors;

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
              onUpdate={(user) => {
                if (!user) return;

                if (index < users.length) {
                  dispatch(upsertUser({ index, user }));
                  return;
                }

                dispatch(
                  upsertUser({
                    user: {
                      ...emptyUser,
                      ...user,
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
          isDisabled={!!stepValidation.disabledNext || shouldShowEmptyUser}
        >
          Add user
        </Button>
      </Content>
    </>
  );
};

export default UserInfo;
