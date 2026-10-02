import React, { useEffect, useState } from 'react';

import { Button, Checkbox } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import {
  ValidatedListInput,
  ValidatedTextInput,
} from '@/Components/ValidatedInputs';
import {
  User,
  validateUserInput,
  ValidationResult,
} from '@/store/slices/wizard';

import { emptyUser } from './constants';

type UserRowProps = {
  user: User | undefined;
  index: number;
  validator: (candidate: User) => ValidationResult<User[]>;
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
  validator,
  onUpdate,
  onRemove,
  isRemoveDisabled,
}: UserRowProps) => {
  const [draft, setDraft] = useState<UserDraft>(() => createDraft(user));

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

  const validateUser = (
    field: 'name' | 'password' | 'ssh_key' | 'groups',
    groups: string[] = draft.groups,
  ) => {
    const candidate = { ...draft, groups };
    const parsed = validateUserInput(candidate);
    const { errors, warnings } = validator(candidate);

    return {
      data: parsed.data,
      errors: errors.filter(
        (issue) => issue.path?.[0] === index && issue.path[1] === field,
      ),
      warnings: (warnings ?? []).filter(
        (issue) => issue.path?.[0] === index && issue.path[1] === field,
      ),
    };
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <>
      <Tr resetOffset>
        <Td>
          <ValidatedTextInput
            ariaLabel='blueprint user name'
            value={draft.name}
            placeholder='Set username'
            inputProps={{ onKeyDown: handleKeyDown }}
            onChange={(_, name) => setDraft({ ...draft, name })}
            validator={() => validateUser('name')}
            onCommit={(candidate) => onUpdate(candidate)}
          />
        </Td>
        <Td>
          <ValidatedTextInput
            value={draft.password}
            ariaLabel='blueprint user password'
            placeholder={draft.hasPassword ? '●'.repeat(8) : 'Set password'}
            inputProps={{ onKeyDown: handleKeyDown }}
            onChange={(_, password) => setDraft({ ...draft, password })}
            validator={() => validateUser('password')}
            onCommit={(candidate) => onUpdate(candidate)}
            kind='password'
          />
        </Td>
        <Td>
          <ValidatedTextInput
            ariaLabel='public SSH key'
            value={draft.ssh_key}
            placeholder='Paste SSH key here'
            inputProps={{ onKeyDown: handleKeyDown }}
            onChange={(_, ssh_key) => setDraft({ ...draft, ssh_key })}
            validator={() => validateUser('ssh_key')}
            onCommit={(candidate) => onUpdate(candidate)}
          />
        </Td>
        <Td>
          <ValidatedListInput
            ariaLabel='Add user group'
            placeholder='Add user group'
            items={draft.groups.map((value) => ({ required: false, value }))}
            validator={(candidate) => validateUser('groups', candidate)}
            onAdd={(value) => {
              const groups = [...draft.groups, value];
              setDraft({ ...draft, groups });
              onUpdate({ groups });
            }}
            onRemove={(value) => {
              const groups = draft.groups.filter((group) => group !== value);
              setDraft({ ...draft, groups });
              onUpdate({
                groups,
              });
            }}
            truncateLength={12}
            isCompact
            hideAddLabel
          />
        </Td>
        <Td>
          <Checkbox
            isChecked={draft.groups.includes('wheel')}
            onChange={handleCheckboxChange}
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
