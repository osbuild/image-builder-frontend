import React from 'react';

import {
  Button,
  Content,
  ContentVariants,
  Icon,
  Popover,
} from '@patternfly/react-core';
import { CheckCircleIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  selectFirstBootScript,
  selectUsers,
  UserGroup,
} from '@/store/slices/wizard';

import { UserGroupsTable } from './ReviewStepTables';

import { useAppSelector } from '../../../../../store/hooks';

export const UsersList = () => {
  const users = useAppSelector(selectUsers);

  return (
    <Table variant='compact' borders={false}>
      <Thead>
        <Tr>
          <Th>Username</Th>
          <Th>Password</Th>
          <Th>SSH key</Th>
          <Th>Groups</Th>
          <Th>Administrator</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((user) => (
          <Tr key={user.name}>
            <Td width={25}>{user.name ? user.name : 'None'}</Td>
            <Td>
              {user.password || user.hasPassword ? '●'.repeat(8) : 'None'}
            </Td>
            <Td>{user.ssh_key ? user.ssh_key : 'None'}</Td>
            <Td>
              {user.groups.length > 0 ? (
                <Popover
                  position='bottom'
                  hasAutoWidth
                  minWidth='30rem'
                  bodyContent={<UserGroupsTable groups={user.groups} />}
                >
                  <Button variant='link' isInline aria-label='View user groups'>
                    {user.groups.length}
                  </Button>
                </Popover>
              ) : (
                'None'
              )}
            </Td>
            <Td>
              {user.isAdministrator ? (
                <>
                  <Icon status='success'>
                    <CheckCircleIcon />
                  </Icon>{' '}
                  Enabled
                </>
              ) : (
                <>
                  <Icon status='danger'>
                    <TimesCircleIcon />
                  </Icon>{' '}
                  Disabled
                </>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const GroupsList = ({ groups }: { groups: UserGroup[] }) => {
  return (
    <Table variant='compact' borders={false} className='pf-v6-u-w-50'>
      <Thead>
        <Tr>
          <Th>Group name</Th>
          <Th>GID</Th>
        </Tr>
      </Thead>
      <Tbody>
        {groups.map((group) => (
          <Tr key={group.name}>
            <Td width={50}>{group.name}</Td>
            <Td>{group.gid !== undefined ? group.gid : 'None'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const FirstBootList = () => {
  const isFirstbootEnabled = !!useAppSelector(selectFirstBootScript);

  return (
    <Content>
      <Content component={ContentVariants.dl} className='review-step-dl'>
        <Content component={ContentVariants.dt} className='pf-v6-u-min-width'>
          First boot script
        </Content>
        <Content component={ContentVariants.dd}>
          {isFirstbootEnabled ? 'Enabled' : 'Disabled'}
        </Content>
      </Content>
    </Content>
  );
};
