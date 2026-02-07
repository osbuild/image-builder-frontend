import React from 'react';

import { Button, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  removeUserGroup,
  setUserGroupNameByIndex,
  UserGroup,
} from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

type GroupRowProps = {
  index: number;
  groupCount: number;
  group: UserGroup;
};

const GroupRow = ({ index, groupCount, group }: GroupRowProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useUserGroupsValidation();
  const getValidationByIndex = (idx: number) => {
    const errors = stepValidation.errors[idx] ?? {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const onRemoveGroup = () => {
    dispatch(removeUserGroup(index));
  };

  const handleGroupNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    dispatch(setUserGroupNameByIndex({ index, name: value }));
  };

  return (
    <Tr>
      <Td>
        <ValidatedInputAndTextArea
          ariaLabel='Group name'
          value={group.name || ''}
          placeholder='Set group name'
          onChange={handleGroupNameChange}
          stepValidation={getValidationByIndex(index)}
          fieldName='groupName'
        />
      </Td>
      <Td>
        <TextInput
          value={group.gid?.toString() || ''}
          isDisabled={true}
          placeholder='Auto-generated'
          aria-label='Group ID'
        />
      </Td>
      <Td>
        <Button
          isDisabled={groupCount <= 1}
          variant='plain'
          icon={<MinusCircleIcon />}
          onClick={onRemoveGroup}
          aria-label='Remove group'
        />
      </Td>
    </Tr>
  );
};

export default GroupRow;
