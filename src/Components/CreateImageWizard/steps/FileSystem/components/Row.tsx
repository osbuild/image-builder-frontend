import React from 'react';

import { Alert, Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import MountpointPrefix from './MountpointPrefix';
import MountpointSuffix from './MountpointSuffix';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
import { removePartition } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { Partition } from '../fscTypes';

export const FileSystemContext = React.createContext<boolean>(true);

type RowPropTypes = {
  partition: Partition;
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
};

const Row = ({ partition, onDragEnd, onDragStart, onDrop }: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };
  const stepValidation = useFilesystemValidation();
  const isPristine = React.useContext(FileSystemContext);

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
        <MountpointPrefix partition={partition} />
        {!isPristine && stepValidation.errors[`mountpoint-${partition.id}`] && (
          <Alert
            variant='danger'
            isInline
            isPlain
            title={stepValidation.errors[`mountpoint-${partition.id}`]}
          />
        )}
      </Td>
      {partition.mountpoint !== '/' &&
      !partition.mountpoint.startsWith('/boot') &&
      !partition.mountpoint.startsWith('/usr') ? (
        <Td width={20}>
          <MountpointSuffix partition={partition} />
        </Td>
      ) : (
        <Td width={20} />
      )}

      <Td width={20}>xfs</Td>
      <Td width={20}>
        <MinimumSize partition={partition} />
      </Td>
      <Td width={10}>
        <SizeUnit partition={partition} />
      </Td>
      <Td width={10}>
        <Button
          variant='link'
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          isDisabled={partition.mountpoint === '/'}
        />
      </Td>
    </Tr>
  );
};

export default Row;
