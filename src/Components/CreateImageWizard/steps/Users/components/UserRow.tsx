import React, { useEffect, useState } from 'react';

import { Button, Checkbox } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { PasswordValidatedInput } from '@/Components/CreateImageWizard/utilities/PasswordValidatedInput';
import { useUsersValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isUserGroupValid } from '@/Components/CreateImageWizard/validators';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { useAppDispatch } from '@/store/hooks';
import { upsertUser, User } from '@/store/slices/wizard';

type UserRowProps = {
  user: User | undefined;
  index: number;
  onUpdate: (user: Partial<User>) => void;
  onRemove: () => void;
  isRemoveDisabled: boolean;
};

type UserDraft = {
  name: string;
  password: string;
  ssh_key: string;
  groups: string[];
  hasPassword: boolean;
};

const UserRow = ({ user, index, onRemove, isRemoveDisabled }: UserRowProps) => {
  const emptyUser = {
    name: user?.name ?? '',
    password: user?.password ?? '',
    ssh_key: user?.ssh_key ?? '',
    groups: user?.groups ?? [],
    hasPassword: false,
  };
  const [draft, setDraft] = useState<UserDraft>(emptyUser);

  useEffect(() => {
    // Reset local drafts when the committed group changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(emptyUser);
  }, [user]);

  const dispatch = useAppDispatch();
  const stepValidation = useUsersValidation();
  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const update = (index: number, user: UserDraft) => {
    setDraft(user);
    dispatch(upsertUser({ index, user }));
  };

  const handleNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string,
  ) => {
    update(index, {
      ...draft,
      name,
    });
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    password: string,
  ) => {
    update(index, {
      ...draft,
      password,
    });
  };

  const handleSshKeyChange = (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    ssh_key: string,
  ) => {
    update(index, {
      ...draft,
      ssh_key,
    });
  };

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    isAdmin: boolean,
  ) => {
    if (isAdmin) {
      update(index, {
        ...draft,
        groups: Array.from(new Set([...draft.groups, 'wheel'])),
      });
      return;
    }

    update(index, {
      ...draft,
      groups: draft.groups.filter((group) => group !== 'wheel'),
    });
  };

  return (
    <>
      <Tr resetOffset>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='blueprint user name'
            value={draft.name}
            placeholder='Set username'
            onChange={(_e, value) => handleNameChange(_e, value)}
            stepValidation={getValidationByIndex(index)}
            fieldName='userName'
            forceErrorDisplay={true}
          />
        </Td>
        <Td>
          <PasswordValidatedInput
            value={draft.password}
            ariaLabel='blueprint user password'
            placeholder='Set password'
            onChange={(_e, value) => handlePasswordChange(_e, value)}
            hasPassword={draft.hasPassword}
          />
        </Td>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='public SSH key'
            value={draft.ssh_key}
            type={'text'}
            onChange={(_e, value) => handleSshKeyChange(_e, value)}
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
            list={draft.groups}
            item='Group'
            addAction={(value) =>
              upsertUser({
                index,
                user: { ...draft, groups: [...draft.groups, value] },
              })
            }
            removeAction={(value) =>
              upsertUser({
                index,
                user: {
                  ...draft,
                  groups: draft.groups.filter((group) => group !== value),
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
            isChecked={draft.groups.includes('wheel')}
            onChange={(_e, value) => handleCheckboxChange(_e, value)}
            aria-label='Administrator'
            id={`${draft.name}-${index}`}
            name='user Administrator'
          />
        </Td>
        <Td>
          <Button
            isDisabled={isRemoveDisabled}
            variant='plain'
            icon={<MinusCircleIcon />}
            onClick={() => onRemove()}
            aria-label='Remove user'
          />
        </Td>
      </Tr>
    </>
  );
};

export default UserRow;
