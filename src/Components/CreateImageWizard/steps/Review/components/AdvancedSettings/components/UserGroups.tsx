import React from 'react';

import { Flex } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectNonEmptyUserGroups } from '@/store/slices/wizard';

import { FlexColumn, ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const UserGroups = ({ shouldHide }: Hideable) => {
  const userGroups = useAppSelector(selectNonEmptyUserGroups);

  if (shouldHide || userGroups.length === 0) {
    return null;
  }

  return (
    <>
      <ReviewGroup heading='User groups' />
      <Flex flexWrap={{ default: 'nowrap' }}>
        <FlexColumn
          heading='Name'
          labelKey='user-group-name-review'
          items={userGroups.map(({ name }) => name)}
        />
        <FlexColumn
          heading='Group ID'
          labelKey='user-group-gid-review'
          items={userGroups.map(({ gid }) => gid ?? 'None')}
        />
      </Flex>
    </>
  );
};
