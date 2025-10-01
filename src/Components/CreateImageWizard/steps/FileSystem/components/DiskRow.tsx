import React from 'react';

import { Alert, Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useAppDispatch } from '../../../../../store/hooks';
import { removeDiskPartition } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
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
  const handleRemovePartition = (id: string) => {
    dispatch(removeDiskPartition(id));
  };
  const stepValidation = useFilesystemValidation();
  const isPristine = React.useContext(FileSystemContext);

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
        {!isPristine && stepValidation.errors[`mountpoint-${partition.id}`] && (
          <Alert
            variant='danger'
            isInline
            isPlain
            title={stepValidation.errors[`mountpoint-${partition.id}`]}
          />
        )}
      </Td>
      <Td width={20}></Td>
      <Td width={20}>{partition.fs_type}</Td>
      <Td width={20}>{partition.min_size}</Td>
      <Td width={10}>{partition.unit}</Td>
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
