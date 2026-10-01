import React, { useEffect, useState } from 'react';

import { Button, Checkbox } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import LabelInput from '@/Components/CreateImageWizard/LabelInput';
import { PasswordValidatedInput } from '@/Components/CreateImageWizard/utilities/PasswordValidatedInput';
import { useUsersValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { isUserGroupValid } from '@/Components/CreateImageWizard/validators';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { upsertUser, User } from '@/store/slices/wizard';

import { emptyUser } from './constants';

type UserRowProps = {
  user: User | undefined;
  index: number;
  onUpdate: (user?: Partial<User> | undefined) => void;
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

const createDraft = (user?: User): UserDraft => ({
  name: user?.name ?? emptyUser.name,
  password: user?.password ?? emptyUser.password,
  ssh_key: user?.ssh_key ?? emptyUser.ssh_key,
  groups: user?.groups ?? emptyUser.groups,
  hasPassword: user?.hasPassword || emptyUser.hasPassword,
});

const UserRow = ({
  user,
  index,
  onUpdate,
  onRemove,
  isRemoveDisabled,
}: UserRowProps) => {
  const [draft, setDraft] = useState<UserDraft>(() => createDraft(user));
  const stepValidation = useUsersValidation();
  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  useEffect(() => {
    // Reset local drafts when the committed user changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(createDraft(user));
  }, [user]);

  const handleCheckboxChange = (
    _event: React.FormEvent<HTMLInputElement>,
    isAdmin: boolean,
  ) => {
    if (isAdmin) {
      const groups = Array.from(new Set([...draft.groups, 'wheel']));
      setDraft({ ...draft, groups });
      onUpdate({ groups });
      return;
    }

    const groups = draft.groups.filter((group) => group !== 'wheel');
    setDraft({ ...draft, groups });
    onUpdate({ groups });
  };

  return (
    <>
      <Tr resetOffset>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='blueprint user name'
            value={draft.name}
            placeholder='Set username'
            onChange={(_, name) => {
              setDraft({ ...draft, name });
              onUpdate({ name });
            }}
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
            onChange={(_, password) => {
              setDraft({ ...draft, password });
              onUpdate({ password });
            }}
            hasPassword={draft.hasPassword}
          />
        </Td>
        <Td>
          <ValidatedInputAndTextArea
            ariaLabel='public SSH key'
            value={draft.ssh_key}
            type={'text'}
            onChange={(_, ssh_key) => {
              setDraft({ ...draft, ssh_key });
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
            list={draft.groups}
            item='Group'
            addAction={(value) => {
              const groups = [...draft.groups, value];
              setDraft({ ...draft, groups });
              return upsertUser({
                index,
                user: { ...draft, groups },
              });
            }}
            removeAction={(value) => {
              const groups = draft.groups.filter((group) => group !== value);
              setDraft({ ...draft, groups });
              return upsertUser({
                index,
                user: { ...draft, groups },
              });
            }}
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
