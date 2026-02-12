import React, { useState } from 'react';

import { Button, Checkbox } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import RemoveUserModal from './RemoveUserModal';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  addGroupToUserByUserIndex,
  addUser,
  removeGroupFromUserByIndex,
  removeUser,
  setUserAdministratorByIndex,
  setUserNameByIndex,
  setUserPasswordByIndex,
  setUserSshKeyByIndex,
  UserWithAdditionalInfo,
} from '../../../../../store/wizardSlice';
import LabelInput from '../../../LabelInput';
import { PasswordValidatedInput } from '../../../utilities/PasswordValidatedInput';
import { useUsersValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { isUserGroupValid } from '../../../validators';

type UserRowProps = {
  user: UserWithAdditionalInfo;
  index: number;
  userCount: number;
};

const UserRow = ({ user, index, userCount }: UserRowProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useUsersValidation();
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const getValidationByIndex = (idx: number) => {
    const errors = stepValidation.errors[idx] ?? {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const onRemove = () => {
    if (
      user.name === '' &&
      user.password === '' &&
      user.ssh_key === '' &&
      !user.isAdministrator
    ) {
      dispatch(removeUser(index));
    } else {
      setShowRemoveUserModal(true);
    }
  };

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserNameByIndex({ index: index, name: value }));
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserPasswordByIndex({ index: index, password: value }));
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(setUserSshKeyByIndex({ index: index, sshKey: value }));
  };

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: boolean,
  ) => {
    if (userCount === 0) {
      dispatch(addUser());
    }
    dispatch(
      setUserAdministratorByIndex({ index: index, isAdministrator: value }),
    );
  };

  return (
    <>
      <Tr>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='blueprint user name'
            value={user.name || ''}
            placeholder='Set username'
            onChange={(_e, value) => handleNameChange(_e, value)}
            stepValidation={getValidationByIndex(index)}
            fieldName='userName'
            forceErrorDisplay={true}
          />
        </Td>
        <Td>
          <PasswordValidatedInput
            value={user.password || ''}
            ariaLabel='blueprint user password'
            placeholder='Set password'
            onChange={(_e, value) => handlePasswordChange(_e, value)}
            hasPassword={user.hasPassword}
          />
        </Td>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='public SSH key'
            value={user.ssh_key || ''}
            type={'text'}
            onChange={(_e, value) => handleSshKeyChange(_e, value)}
            placeholder='Set SSH key'
            stepValidation={getValidationByIndex(index)}
            fieldName='userSshKey'
          />
        </Td>
        <Td>
          <LabelInput
            ariaLabel='Add user group'
            placeholder='Add user group'
            validator={isUserGroupValid}
            list={user.groups}
            item='Group'
            addAction={(value) =>
              addGroupToUserByUserIndex({ index: index, group: value })
            }
            removeAction={(value) =>
              removeGroupFromUserByIndex({ index: index, group: value })
            }
            stepValidation={getValidationByIndex(index)}
            fieldName='groups'
            addOnBlur={true}
          />
        </Td>
        <Td>
          <Checkbox
            isChecked={user.isAdministrator || user.groups.includes('wheel')}
            onChange={(_e, value) => handleCheckboxChange(_e, value)}
            aria-label='Administrator'
            id={`${user.name}-${index}`}
            name='user Administrator'
          />
        </Td>
        <Td>
          <Button
            isDisabled={userCount <= 1}
            variant='plain'
            icon={<MinusCircleIcon />}
            onClick={() => onRemove()}
            aria-label='Remove user'
          />
        </Td>
      </Tr>
      <RemoveUserModal
        setShowRemoveUserModal={setShowRemoveUserModal}
        index={index}
        isOpen={showRemoveUserModal}
        userName={user.name || ''}
      />
    </>
  );
};

export default UserRow;
