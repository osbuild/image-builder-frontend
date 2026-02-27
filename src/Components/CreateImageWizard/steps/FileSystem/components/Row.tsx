import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
import { removePartition } from '../../../../../store/wizardSlice';
import { FilesystemPartition } from '../fscTypes';

export const FileSystemContext = React.createContext<boolean>(true);

type RowPropTypes = {
  partition: FilesystemPartition;
  isRemovingDisabled: boolean;
};

const Row = ({ partition, isRemovingDisabled }: RowPropTypes) => {
  const dispatch = useAppDispatch();
  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };

  const customization = 'fileSystem';

  return (
    <Tr id={partition.id}>
      <Td>
        <Mountpoint partition={partition} customization={customization} />
      </Td>
      <Td width={20}>xfs</Td>
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
          isDisabled={isRemovingDisabled}
        />
      </Td>
    </Tr>
  );
};

export default Row;
