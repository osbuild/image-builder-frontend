import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import PartitionName from './PartitionName';
import PartitionType from './PartitionType';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
import { removeDiskPartition } from '../../../../../store/wizardSlice';
import { FscDiskPartition } from '../fscTypes';

export const FileSystemContext = React.createContext<boolean>(true);

type DiskRowPropTypes = {
  partition: FscDiskPartition;
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
      <Td className='pf-m-width-20'>
        <PartitionName partition={partition} customization={customization} />
      </Td>
      <Td width={20}>{partition.mountpoint}</Td>
      <Td width={20}></Td>
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
        />
      </Td>
    </Tr>
  );
};

export default DiskRow;
