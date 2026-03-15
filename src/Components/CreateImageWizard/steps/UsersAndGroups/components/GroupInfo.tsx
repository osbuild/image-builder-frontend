import React from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import GroupRow from './GroupRow';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addUserGroup,
  selectUserGroups,
} from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';

type GroupInfoProps = {
  attemptedNext?: boolean | undefined;
};

const GroupInfo = ({ attemptedNext = false }: GroupInfoProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);
  const groupsValidation = useUserGroupsValidation();
  const hasErrors = !!groupsValidation.disabledNext;
  const showAlert = attemptedNext && hasErrors;

  const onAddGroupClick = () => {
    dispatch(addUserGroup());
  };

  return (
    <>
      {showAlert && (
        <Alert
          variant='danger'
          isInline
          title='Errors found'
          className='pf-v6-u-mt-lg'
        />
      )}
      <Table variant='compact' borders={false}>
        <Thead>
          <Tr>
            <Th width={30}>Group name</Th>
            <Th width={30}>Group ID</Th>
            <Th width={10} aria-label='Remove group' />
          </Tr>
        </Thead>
        <Tbody>
          {groups.map((group, index) => (
            <GroupRow
              key={index}
              index={index}
              groupCount={groups.length}
              group={group}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={onAddGroupClick}
          icon={<AddCircleOIcon />}
          isDisabled={!!groupsValidation.disabledNext}
        >
          Add group
        </Button>
      </Content>
    </>
  );
};

export default GroupInfo;
