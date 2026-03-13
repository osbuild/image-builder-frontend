import React, { useEffect, useState } from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import {
  removeUserGroup,
  setUserGroupGidByIndex,
  setUserGroupNameByIndex,
  UserGroup,
} from '@/store/slices/wizard';

import { useAppDispatch } from '../../../../../store/hooks';
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
  const [gidInput, setGidInput] = useState<string>(
    group.gid !== undefined ? String(group.gid) : '',
  );

  useEffect(() => {
    setGidInput(group.gid !== undefined ? String(group.gid) : '');
  }, [group.gid]);

  const isDigitsOnly = (value: string) => /^\d+$/.test(value);
  const isGidInputInvalid = gidInput !== '' && !isDigitsOnly(gidInput);

  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? { ...stepValidation.errors[idx] } : {};
    if (isGidInputInvalid) {
      errors.groupGid = 'Invalid input. Must be a number';
    }
    return {
      errors,
      disabledNext: stepValidation.disabledNext || isGidInputInvalid,
    };
  };

  const getWarningByIndex = (idx: number) => {
    const warnings =
      idx in stepValidation.warnings ? stepValidation.warnings[idx] : {};
    return warnings;
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
    setGidInput(value);
    if (value === '') {
      dispatch(setUserGroupGidByIndex({ index, gid: undefined }));
    } else if (isDigitsOnly(value)) {
      dispatch(setUserGroupGidByIndex({ index, gid: parseInt(value, 10) }));
    }
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
          value={gidInput}
          placeholder='Set group ID'
          onChange={handleGroupGidChange}
          stepValidation={getValidationByIndex(index)}
          fieldName='groupGid'
          warning={
            !isGidInputInvalid ? getWarningByIndex(index).groupGid : undefined
          }
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
