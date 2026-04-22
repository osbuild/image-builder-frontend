import React from 'react';

import { Button, TextInput } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { removePartition } from '@/store/slices/wizard';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import SizeUnit from './SizeUnit';

import { useAppDispatch } from '../../../../../store/hooks';
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
      <Td width={40}>
        <Mountpoint partition={partition} customization={customization} />
      </Td>
      <Td width={20}>
        <TextInput
          value='xfs'
          type='text'
          aria-label='Partition type'
          isDisabled
        />
      </Td>
      <Td width={20}>
        <MinimumSize partition={partition} customization={customization} />
      </Td>
      <Td width={20}>
        <SizeUnit partition={partition} customization={customization} />
      </Td>
      <Td isActionCell>
        <Button
          variant='plain'
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          isDisabled={isRemovingDisabled}
          aria-label='Remove partition'
        />
      </Td>
    </Tr>
  );
};

export default Row;
