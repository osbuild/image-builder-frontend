import React, { useState } from 'react';

import { Alert, Button, Content } from '@patternfly/react-core';
import { AddCircleOIcon } from '@patternfly/react-icons';
import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
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
  const [showDraft, setShowDraft] = useState(false);

  const { errors } = validateGroupList(groups);

  const showAlert = attemptedNext && errors.length > 0;
  const shouldShowDraft = showDraft || groups.length === 0;

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
              kind='committed'
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
          {shouldShowDraft && (
            <GroupRow
              key='draft'
              index={groups.length}
              kind='draft'
              group={{ name: '' }}
              validator={(candidate) =>
                validateGroupList([...groups, candidate])
              }
              onUpdate={(group) => {
                if (!group) return;

                if (typeof group.name !== 'string') {
                  return;
                }

                dispatch(
                  upsertUserGroup({ group: { ...group, name: group.name } }),
                );
                setShowDraft(false);
              }}
              onRemove={() => setShowDraft(false)}
              isRemoveDisabled={groups.length === 0}
            />
          )}
        </Tbody>
      </Table>
      <Content>
        <Button
          variant='link'
          onClick={() => setShowDraft(true)}
          icon={<AddCircleOIcon />}
          isDisabled={errors.length > 0 || shouldShowDraft}
        >
          Add group
        </Button>
      </Content>
    </>
  );
};

export default GroupInfo;
