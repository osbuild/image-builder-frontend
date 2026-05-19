import React from 'react';

import { Flex, Truncate } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectNonEmptyUsers } from '@/store/slices/wizard';

import { FlexColumn, ReviewGroup, StatusItem } from '../../shared';
import { Hideable } from '../../types';

export const Users = ({ shouldHide }: Hideable) => {
  const nonEmptyUsers = useAppSelector(selectNonEmptyUsers);

  if (shouldHide || nonEmptyUsers.length === 0) {
    return null;
  }

  return (
    <>
      <ReviewGroup heading='Users' />
      <Flex>
        <FlexColumn
          heading='Username'
          labelKey='user-name-review'
          items={nonEmptyUsers.map(({ name }) => name)}
        />
        <FlexColumn
          heading='Password'
          labelKey='user-password-review'
          items={nonEmptyUsers.map((_) => '*****')}
        />
        <FlexColumn
          heading='SSH key'
          labelKey='user-sshkey-review'
          items={nonEmptyUsers.map(({ ssh_key }, index) => (
            <Truncate
              key={`inner-ssh-key-${index}`}
              content={ssh_key}
              position='end'
              maxCharsDisplayed={15}
            />
          ))}
        />
        <FlexColumn
          heading='Groups'
          labelKey='user-groups-review'
          items={nonEmptyUsers.map(({ groups }, index) => (
            <Truncate
              key={`inner-groups-key-${index}`}
              content={groups.filter((group) => group.trim()).join(', ')}
              position='end'
              maxCharsDisplayed={15}
            />
          ))}
        />
        <FlexColumn
          heading='Administrator'
          labelKey='user-admin-review'
          items={nonEmptyUsers.map(({ isAdministrator }, index) => (
            <StatusItem
              key={`inner-admin-key-${index}`}
              variant={isAdministrator ? 'success' : 'danger'}
            >
              {isAdministrator ? 'Enabled' : 'Disabled'}
            </StatusItem>
          ))}
        />
      </Flex>
    </>
  );
};
