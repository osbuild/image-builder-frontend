import React from 'react';

import {
  Button,
  FormGroup,
  Grid,
  GridItem,
  TextInput,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import AddCircleOIcon from '@patternfly/react-icons/dist/esm/icons/add-circle-o-icon';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  addGroup,
  removeGroup,
  setGroupNameByIndex,
} from '../../../../../store/wizardSlice';
import { useGroupsValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { isUserGroupValid } from '../../../validators';

type GroupRowProps = {
  groupName: string;
  groupId?: number;
  index: number;
  groupCount: number;
  isAddButtonDisabled: boolean;
};

const GroupRow = ({
  groupName,
  groupId,
  index,
  groupCount,
  isAddButtonDisabled,
}: GroupRowProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useGroupsValidation();

  const getValidationByIndex = (idx: number) => {
    const errors =
      idx in stepValidation.errors ? stepValidation.errors[idx] : {};
    return {
      errors,
      disabledNext: stepValidation.disabledNext,
    };
  };

  const onAddGroupClick = () => {
    dispatch(
      addGroup({
        name: '',
        description: '',
        repository: 'custom',
        package_list: [],
      }),
    );
  };

  const onRemoveGroup = () => {
    dispatch(removeGroup(groupName));
  };

  const handleGroupNameChange = (
    _e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value: string,
  ) => {
    if (groupCount === 0) {
      dispatch(
        addGroup({
          name: '',
          description: '',
          repository: 'custom',
          package_list: [],
        }),
      );
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      dispatch(removeGroup(groupName));
      return;
    }

    // If value is valid and group doesn't have gid yet, recreate it to get a gid
    if (isUserGroupValid(trimmedValue) && !groupId) {
      dispatch(removeGroup(groupName));
      dispatch(
        addGroup({
          name: trimmedValue,
          description: '',
          repository: 'custom',
          package_list: [],
        }),
      );
      return;
    }

    dispatch(setGroupNameByIndex({ index, name: value }));
  };

  const trimmedName = groupName.trim();
  const hasName = trimmedName.length > 0;
  const isValidName = hasName && isUserGroupValid(trimmedName);
  const isLastRow = index === groupCount - 1;

  return (
    <Grid hasGutter md={11}>
      <GridItem span={2}>
        <FormGroup isRequired label='Group name' className='pf-v6-u-pb-md'>
          <ValidatedInputAndTextArea
            ariaLabel='Group name'
            value={groupName || ''}
            placeholder='Set group name'
            onChange={handleGroupNameChange}
            stepValidation={getValidationByIndex(index)}
            fieldName='groupName'
          />
          {hasName && isLastRow && (
            <Button
              variant='link'
              onClick={onAddGroupClick}
              icon={<AddCircleOIcon />}
              isDisabled={!isValidName || isAddButtonDisabled}
              className='pf-v6-u-mt-md'
            >
              Add group
            </Button>
          )}
        </FormGroup>
      </GridItem>
      <GridItem span={4}>
        <FormGroup label='Group ID' className='pf-v6-u-pb-md'>
          <TextInput
            value={hasName && groupId ? groupId.toString() : ''}
            readOnly
            placeholder='Auto-generated'
            aria-label='Group ID'
          />
          <div className='pf-v6-u-mt-sm pf-v6-u-font-size-sm pf-v6-u-color-200'>
            Each group will automatically be assigned an ID number.
          </div>
        </FormGroup>
      </GridItem>
      <GridItem span={1}>
        <FormGroup label=' ' className='pf-v6-u-pb-md'>
          <Button
            isDisabled={groupCount <= 1}
            variant='plain'
            icon={<MinusCircleIcon />}
            onClick={onRemoveGroup}
            aria-label='Remove group'
          />
        </FormGroup>
      </GridItem>
    </Grid>
  );
};

export default GroupRow;
