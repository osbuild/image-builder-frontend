import React, { useState } from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useUsersValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeUser, selectUsers } from '@/store/slices/wizard';

import UserRow from './UserRow';
import RemoveUserModal from './RemoveUserModal';

type UserInfoProps = {
  attemptedNext?: boolean | undefined;
};

const UserInfo = ({ attemptedNext = false }: UserInfoProps) => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const [showEmptyUser, setShowEmptyUser] = useState(false);
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);

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
            <>
              <RemoveUserModal
                isOpen={showRemoveUserModal}
                userName={user?.name ?? ''}
                onClose={() => setShowRemoveUserModal(false)}
                onRemove={() => {
                  dispatch(removeUser(index));
                  setShowRemoveUserModal(false);
                }}
              />
              <UserRow
                key={index}
                user={user}
                index={index}
                isRemoveDisabled={users.length === 0}
                onUpdate={(user) => {
                  if (!user) return;
                }}
                onRemove={() => {
                  if (!user) {
                    return;
                  }

                  if (index === users.length) {
                    setShowEmptyUser(false);
                    return;
                  }

                  if (user.name === '') {
                    dispatch(removeUser(index));
                  }

                  setShowEmptyUser(false);
                }}
              />
            </>
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={() => setShowEmptyUser(true)}
          icon={<AddCircleOIcon />}
          isDisabled={!!stepValidation.disabledNext || showEmptyUser}
        >
          Add user
        </Button>
      </Content>
    </>
  );
};

export default UserInfo;
