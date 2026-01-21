import React from 'react';

import { Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import GroupRow from './GroupRow';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  addUserGroup,
  selectUserGroups,
} from '../../../../../store/wizardSlice';
import { useUserGroupsValidation } from '../../../utilities/useValidation';

const GroupInfo = () => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);
  const groupsValidation = useUserGroupsValidation();

  const groupsToRender =
    groups.length === 0
      ? [
          {
            id: 'placeholder',
            name: '',
            gid: undefined,
          },
        ]
      : groups;

  const onAddGroupClick = () => {
    dispatch(addUserGroup());
  };

  return (
    <>
      <Table variant='compact' borders={false}>
        <Thead>
          <Tr>
            <Th width={30}>Group name</Th>
            <Th width={30}>Group ID</Th>
            <Th width={10} aria-label='Remove group' />
          </Tr>
        </Thead>
        <Tbody>
          {groupsToRender.map((_group, index) => (
            <GroupRow
              key={groupsToRender[index].id}
              index={index}
              groupCount={groups.length}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={onAddGroupClick}
          icon={<AddCircleOIcon />}
          isDisabled={!!groupsValidation.disabledNext || groups.length < 1}
        >
          Add group
        </Button>
      </Content>
    </>
  );
};

export default GroupInfo;
