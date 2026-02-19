import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  removeUserGroup,
  setUserGroupGidByIndex,
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
    dispatch(setUserGroupNameByIndex({ index, name: value }));
  };

  const handleGroupGidChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    dispatch(setUserGroupGidByIndex({ index, gid: value }));
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
        <ValidatedInputAndTextArea
          ariaLabel='Group ID'
          value={group.gid?.toString() || ''}
          placeholder='Auto-generated'
          onChange={handleGroupGidChange}
          stepValidation={getValidationByIndex(index)}
          fieldName='groupGid'
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
