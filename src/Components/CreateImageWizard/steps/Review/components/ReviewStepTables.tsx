import React from 'react';

import { Panel, PanelMain } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { UserWithAdditionalInfo } from '@/store/slices';

type UserGroupsTableProps = {
  groups: UserWithAdditionalInfo['groups'];
};

export const UserGroupsTable = ({ groups }: UserGroupsTableProps) => {
  return (
    <Panel isScrollable>
      <PanelMain maxHeight='30ch'>
        <Table aria-label='User groups table' variant='compact'>
          <Thead>
            <Tr>
              <Th>Group name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {groups.map((group) => (
              <Tr key={group}>
                <Td>{group}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};
