import React, { useEffect, useState } from 'react';

import { Button, HelperText, HelperTextItem } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import {
  Group,
  validateGroupGidInput,
  validateGroupInput,
} from '@/store/slices/wizard';
import { ValidationResult } from '@/store/slices/wizard/types';

type GroupRowProps = {
  index: number;
  group: Group;
  kind: 'committed' | 'draft';
  validator: (candidate: Group) => ValidationResult<Group[]>;
  onUpdate: (group?: Partial<Group> | undefined) => void;
  onRemove: () => void;
  isRemoveDisabled: boolean;
};

type GroupDraft = {
  name: string;
  gid: string;
};

const GroupRow = ({
  index,
  kind,
  group,
  isRemoveDisabled,
  validator,
  onUpdate,
  onRemove,
}: GroupRowProps) => {
  const [draft, setDraft] = useState<GroupDraft>({
    name: group.name,
    gid: String(group.gid ?? ''),
  });

  useEffect(() => {
    // Reset local drafts when the committed group changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft({
      name: group.name,
      gid: String(group.gid ?? ''),
    });
  }, [group.name, group.gid]);

  const handleGroupNameChange = (
    _: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setDraft({
      ...draft,
      name: value,
    });

    // the draft is a presentational input, we only
    // want to commit this to the redux store on blur
    if (kind === 'draft') return;

    onUpdate({ name: value });
  };

  const handleGroupGidChange = (
    _: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setDraft({
      ...draft,
      gid: value,
    });

    const parsed = validateGroupGidInput(value);
    if (parsed.errors.length > 0) {
      return;
    }

    onUpdate({
      gid: parsed.data,
    });
  };

  const validateGroup = (field: 'name' | 'gid') => {
    const parsed = validateGroupInput(draft);
    if (!parsed.data || parsed.errors.length > 0) {
      return {
        ...parsed,
        errors: parsed.errors.filter((issue) => issue.path?.[0] === field),
      };
    }

    const { errors, warnings } = validator(parsed.data);
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

  const handleGroupGidCommit = (group?: Group) => {
    // Keep invalid-name drafts editable when focus leaves the GID field.
    if (kind === 'draft') return;

    onUpdate(group);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <Tr resetOffset>
      <Td>
        <ValidatedTextInput
          ariaLabel='Group name'
          value={draft.name}
          placeholder='Set group name'
          inputProps={{ onKeyDown: handleKeyDown }}
          onChange={handleGroupNameChange}
          validator={() => validateGroup('name')}
          onCommit={(group) => onUpdate(group)}
        />
      </Td>
      <Td>
        <ValidatedTextInput
          ariaLabel='Group ID'
          value={draft.gid}
          placeholder='Set group ID'
          inputProps={{ onKeyDown: handleKeyDown }}
          onChange={handleGroupGidChange}
          validator={() => validateGroup('gid')}
          onCommit={handleGroupGidCommit}
          isDisabled={kind === 'draft' && draft.name.trim() === ''}
        />
        <HelperText>
          <HelperTextItem>
            A Group ID will be assigned if this field is left blank
          </HelperTextItem>
        </HelperText>
      </Td>
      <Td>
        <Button
          isDisabled={isRemoveDisabled}
          variant='plain'
          icon={<MinusCircleIcon />}
          onClick={() => onRemove()}
          aria-label='Remove group'
        />
      </Td>
    </Tr>
  );
};

export default GroupRow;
