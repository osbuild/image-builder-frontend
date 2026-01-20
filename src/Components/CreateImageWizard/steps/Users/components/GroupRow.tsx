import React from 'react';

import { Button, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addUserGroup,
  removeUserGroup,
  selectUserGroups,
  setUserGroupNameByIndex,
} from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';

type GroupRowProps = {
  index: number;
  groupCount: number;
};

const GroupRow = ({ index, groupCount }: GroupRowProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);
  const stepValidation = useUserGroupsValidation();
  const group = groups[index] || {
    id: 'placeholder',
    name: '',
    gid: undefined,
  };

  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
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
    if (groupCount === 0) {
      dispatch(addUserGroup());
    }
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
