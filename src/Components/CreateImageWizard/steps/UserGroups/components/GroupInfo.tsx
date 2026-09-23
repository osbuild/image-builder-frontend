import React, { useState } from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  Group,
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
  const [showEmptyGroup, setShowEmptyGroup] = useState(false);

  const { errors } = validateGroupList(groups);

  const showAlert = attemptedNext && errors.length > 0;
  const shouldShowEmptyGroup = showEmptyGroup || groups.length === 0;
  // Keep the empty editor in the same list so its input survives the first store update.
  const displayGroups = shouldShowEmptyGroup ? [...groups, undefined] : groups;

  const handleGroupValidation = (index: number, candidate: Group) => {
    if (index < groups.length) {
      const updatedGroups = [...groups];
      updatedGroups[index] = candidate;
      return validateGroupList(updatedGroups);
    }

    return validateGroupList([...groups, candidate]);
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
          {displayGroups.map((group, index) => (
            <GroupRow
              key={index}
              index={index}
              group={group}
              validator={(candidate) => handleGroupValidation(index, candidate)}
              onUpdate={(group) => {
                if (!group) return;

                if (index < groups.length) {
                  dispatch(upsertUserGroup({ index, group }));
                  return;
                }

                if (typeof group.name !== 'string' || !group.name.trim()) {
                  return;
                }

                dispatch(
                  upsertUserGroup({ group: { ...group, name: group.name } }),
                );
                setShowEmptyGroup(false);
              }}
              onRemove={() => {
                if (index < groups.length) {
                  dispatch(removeUserGroup(index));
                  return;
                }

                setShowEmptyGroup(false);
              }}
              isRemoveDisabled={groups.length === 0}
            />
          ))}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={() => setShowEmptyGroup(true)}
          icon={<AddCircleOIcon />}
          isDisabled={errors.length > 0 || shouldShowEmptyGroup}
        >
          Add group
        </Button>
      </Content>
    </>
  );
};

export default GroupInfo;
