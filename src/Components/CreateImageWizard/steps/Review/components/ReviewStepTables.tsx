import React from 'react';

import { Content, Panel, PanelMain } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import {
  selectDiskPartitions,
  selectFilesystemPartitions,
  UserWithAdditionalInfo,
} from '@/store/slices/wizard';

import { useAppSelector } from '../../../../../store/hooks';

export const FSReviewTable = () => {
  const partitions = useAppSelector(selectFilesystemPartitions);
  return (
    <Panel isScrollable>
      <PanelMain maxHeight='30ch'>
        <Table aria-label='File system configuration table' variant='compact'>
          <Thead>
            <Tr>
              <Th>Mount point</Th>
              <Th>File system type</Th>
              <Th>Minimum size</Th>
            </Tr>
          </Thead>
          <Tbody>
            {partitions.map((partition, partitionIndex) => (
              <Tr key={partitionIndex}>
                <Td className='pf-m-width-30'>{partition.mountpoint}</Td>
                <Td className='pf-m-width-30'>xfs</Td>
                <Td className='pf-m-width-30'>
                  {parseInt(partition.min_size).toString()} {partition.unit}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PanelMain>
    </Panel>
  );
};

export const DiskReviewTable = () => {
  const partitions = useAppSelector(selectDiskPartitions);
  return (
    <Panel isScrollable>
      <PanelMain>
        <Content component='h4'>Plain partitions</Content>
        <Table aria-label='Plain partitions' variant='compact'>
          <Thead>
            <Tr>
              <Th>Mount point</Th>
              <Th>File system type</Th>
              <Th>Minimum size</Th>
            </Tr>
          </Thead>
          <Tbody>
            {partitions
              .filter((p) => 'mountpoint' in p)
              .map((partition) => (
                <Tr key={partition.id}>
                  <Td className='pf-m-width-30'>
                    {'mountpoint' in partition ? partition.mountpoint : ''}
                  </Td>
                  <Td className='pf-m-width-30'>xfs</Td>
                  <Td className='pf-m-width-30'>
                    {partition.min_size
                      ? `${partition.min_size} ${partition.unit}`
                      : ''}
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
        {partitions
          .filter((p) => 'logical_volumes' in p)
          .map((vg) => {
            return (
              <React.Fragment key={vg.id}>
                <Content component='h4'>
                  Volume group {vg.name && vg.name}
                </Content>
                {vg.min_size && (
                  <Content>Minimum size: {`${vg.min_size} ${vg.unit}`}</Content>
                )}
                <Table aria-label='Logical volumes' variant='compact'>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Mount point</Th>
                      <Th>File system type</Th>
                      <Th>Minimum size</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vg.logical_volumes.map((lv, lvIndex) => (
                      <Tr key={lvIndex}>
                        <Td>{lv.name}</Td>
                        <Td>{lv.mountpoint}</Td>
                        <Td>{lv.fs_type}</Td>
                        <Td>
                          {lv.min_size ? `${lv.min_size} ${lv.unit}` : ''}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </React.Fragment>
            );
          })}
      </PanelMain>
    </Panel>
  );
};

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
