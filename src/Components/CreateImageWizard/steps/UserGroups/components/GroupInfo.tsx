import React from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addUserGroup,
  removeUserGroup,
  selectUserGroups,
  upsertUserGroup,
  validateGroupList,
} from '@/store/slices/wizard';

import GroupRow from './GroupRow';

type GroupInfoProps = {
  attemptedNext?: boolean | undefined;
};

const GroupInfo = ({ attemptedNext = false }: GroupInfoProps) => {
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectUserGroups);

  const { errors } = validateGroupList(groups);
  const showAlert = attemptedNext && errors.length > 0;

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
            <Th width={30}>Name</Th>
            <Th width={30}>Group ID</Th>
            <Th width={10} aria-label='Remove group' />
          </Tr>
        </Thead>
        <Tbody>
          {groups.map((group, index) => (
            <GroupRow
              key={index}
              index={index}
              group={group}
              validator={(candidate) =>
                validateGroupList(
                  groups.map((current, currentIndex) =>
                    index === currentIndex ? candidate : current,
                  ),
                )
              }
              onUpdate={(group) => {
                if (!group) return;

                dispatch(upsertUserGroup({ index, group }));
              }}
              onRemove={() => dispatch(removeUserGroup(index))}
              isRemoveDisabled={groups.length <= 1}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={onAddGroupClick}
          icon={<AddCircleOIcon />}
          isDisabled={errors.length > 0}
        >
          Add group
        </Button>
      </Content>
    </>
  );
};

export default GroupInfo;
