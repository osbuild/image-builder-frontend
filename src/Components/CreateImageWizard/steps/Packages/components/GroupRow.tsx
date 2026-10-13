import React, { useState } from 'react';

import { Content } from '@patternfly/react-core';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Tr,
} from '@patternfly/react-table';

import { GroupWithRepositoryInfo } from '@/store/slices/wizard';

import RemovePackageButton from './RemovePackageButton';

type GroupRowProps = {
  group: GroupWithRepositoryInfo;
  rowIndex: number;
  onRemove: (group: GroupWithRepositoryInfo) => void;
};

const GroupRow = ({ group, rowIndex, onRemove }: GroupRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Tbody isExpanded={isExpanded}>
      <Tr data-testid='package-row'>
        <Td
          expand={{
            rowIndex: rowIndex,
            isExpanded: isExpanded,
            onToggle: () => setIsExpanded(!isExpanded),
            expandId: `${group.name}-expandable`,
          }}
        />
        <Td>@{group.name}</Td>
        <Td>N/A</Td>
        <Td>N/A</Td>
        <Td>
          <RemovePackageButton
            item={group}
            onRemove={(item) => onRemove(item as GroupWithRepositoryInfo)}
          />
        </Td>
      </Tr>
      <Tr isExpanded={isExpanded}>
        <Td colSpan={5}>
          <ExpandableRowContent>
            <div
              style={
                group.package_list?.length
                  ? { maxHeight: '40em', overflow: 'scroll' }
                  : {}
              }
            >
              {group.package_list?.length ? (
                <Table
                  variant='compact'
                  data-testid='group-included-packages-table'
                >
                  <Tbody>
                    {group.package_list.map((pkg: string) => (
                      <Tr key={`details-${pkg}`}>
                        <Td>{pkg}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Content>This group has no packages</Content>
              )}
            </div>
          </ExpandableRowContent>
        </Td>
      </Tr>
    </Tbody>
  );
};

export default GroupRow;
