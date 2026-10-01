import React, { useState } from 'react';

import { Button, Checkbox } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { PasswordValidatedInput } from '@/Components/CreateImageWizard/utilities/PasswordValidatedInput';
import { useUsersValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isUserGroupValid } from '@/Components/CreateImageWizard/validators';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { useAppDispatch } from '@/store/hooks';
import { removeUser, upsertUser, User } from '@/store/slices/wizard';

import RemoveUserModal from './RemoveUserModal';

type UserRowProps = {
  user: User;
  index: number;
  userCount: number;
  onUpdate: (user?: Partial<User> | undefined) => void;
};

const UserRow = ({ user, index, userCount, onUpdate }: UserRowProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useUsersValidation();
  const [showRemoveUserModal, setShowRemoveUserModal] = useState(false);
  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const onRemove = () => {
    if (user.name === '' && user.password === '' && user.ssh_key === '') {
      dispatch(removeUser(index));
    } else {
      setShowRemoveUserModal(true);
    }
  };

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    isAdmin: boolean,
  ) => {
    if (isAdmin) {
      onUpdate({
        groups: Array.from(new Set([...user.groups, 'wheel'])),
      });
      return;
    }

    onUpdate({
      groups: user.groups.filter((group) => group !== 'wheel'),
    });
  };

  return (
    <>
      <Tr resetOffset>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='blueprint user name'
            value={user.name || ''}
            placeholder='Set username'
            onChange={(_, name) => {
              onUpdate({ name });
            }}
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
            onChange={(_, password) => {
              onUpdate({ password });
            }}
            hasPassword={user.hasPassword}
          />
        </Td>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='public SSH key'
            value={user.ssh_key || ''}
            type={'text'}
            onChange={(_, ssh_key) => {
              onUpdate({ ssh_key });
            }}
            placeholder='Paste SSH key here'
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
              upsertUser({
                index,
                user: { ...user, groups: [...user.groups, value] },
              })
            }
            removeAction={(value) =>
              upsertUser({
                index,
                user: {
                  ...user,
                  groups: user.groups.filter((group) => group !== value),
                },
              })
            }
            stepValidation={getValidationByIndex(index)}
            fieldName='groups'
            truncateLength={12}
            isCompact
            hideAddLabel
          />
        </Td>
        <Td>
          <Checkbox
            isChecked={user.groups.includes('wheel')}
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
