import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import MountpointPrefix from './MountpointPrefix';
import MountpointSuffix from './MountpointSuffix';
import PartitionName from './PartitionName';
import PartitionType from './PartitionType';
import SizeUnit from './SizeUnit';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  removeDiskPartition,
  selectDiskPartitions,
} from '../../../../../store/wizardSlice';
import { DiskPartition, FilesystemPartition } from '../fscTypes';

export const FileSystemContext = React.createContext<boolean>(true);

type DiskRowPropTypes = {
  partition: DiskPartition;
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
};

const DiskRow = ({
  partition,
  onDragEnd,
  onDragStart,
  onDrop,
}: DiskRowPropTypes) => {
  const dispatch = useAppDispatch();
  const partitions = useAppSelector(selectDiskPartitions);

  const customization = 'disk';

  const handleRemovePartition = (id: string) => {
    dispatch(removeDiskPartition(id));
  };

  if (partition.type === 'lvm' || partition.type === 'btrfs') {
    return;
  }

  return (
    <Tr
      draggable
      id={partition.id}
      onDrop={onDrop}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Td
        draggableRow={{
          id: `draggable-row-${partition.id}`,
        }}
      />
      {partition.type !== 'plain' && (
        <Td className='pf-m-width-20'>
          <PartitionName partition={partition} customization={customization} />
        </Td>
      )}
      <Td width={20}>
        <MountpointPrefix
          partition={partition as FilesystemPartition}
          customization={customization}
        />
      </Td>
      {partition.mountpoint !== '/' &&
      !partition.mountpoint?.startsWith('/boot') &&
      !partition.mountpoint?.startsWith('/usr') ? (
        <Td width={20}>
          <MountpointSuffix
            partition={partition as FilesystemPartition}
            customization={customization}
          />
        </Td>
      ) : (
        <Td width={20} />
      )}
      <Td width={20}>
        <PartitionType partition={partition} customization={customization} />
      </Td>
      <Td width={20}>
        <MinimumSize partition={partition} customization={customization} />
      </Td>
      <Td width={10}>
        <SizeUnit partition={partition} customization={customization} />
      </Td>
      <Td width={10}>
        <Button
          variant='link'
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          isDisabled={
            partition.mountpoint === '/' &&
            partitions.filter((p) => p.type === 'plain').length > 1
          }
        />
      </Td>
    </Tr>
  );
};

export default DiskRow;
