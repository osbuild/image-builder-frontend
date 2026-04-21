import React, { useMemo } from 'react';

import { Table, Tbody, Th, Thead, Tr } from '@patternfly/react-table';

import DiskRow from './DiskRow';
import Row from './Row';

import { DiskPartition, FilesystemPartition } from '../fscTypes';

type FileSystemTableTypes =
  | {
      partitions: FilesystemPartition[];
      mode: 'filesystem';
    }
  | {
      partitions: DiskPartition[];
      mode: 'disk-plain' | 'disk-lvm';
    };

const FileSystemTable = ({ partitions, mode }: FileSystemTableTypes) => {
  const isFilesystemPartition = (
    p: FilesystemPartition | DiskPartition,
  ): p is FilesystemPartition => !('type' in p);

  const rootPartitionsCount = useMemo(
    () =>
      partitions
        .filter(isFilesystemPartition)
        .filter((p) => p.mountpoint === '/').length,
    [partitions],
  );

  return (
    <Table aria-label='File system table' variant='compact' borders={false}>
      <Thead>
        <Tr>
          {mode === 'disk-lvm' && <Th>Name</Th>}
          <Th>Mount point</Th>
          <Th>Type</Th>
          <Th>Minimum size</Th>
          <Th aria-label='Unit'>Unit</Th>
          <Th aria-label='Remove mount point' />
        </Tr>
      </Thead>

      <Tbody>
        {partitions.length > 0 && mode === 'filesystem'
          ? partitions.map((partition) => (
              <Row
                key={partition.id}
                partition={partition as FilesystemPartition}
                isRemovingDisabled={
                  rootPartitionsCount === 1 && partition.mountpoint === '/'
                }
              />
            ))
          : partitions.map((partition) => (
              <DiskRow
                key={partition.id}
                partition={partition as DiskPartition}
              />
            ))}
      </Tbody>
    </Table>
  );
};

export default FileSystemTable;
