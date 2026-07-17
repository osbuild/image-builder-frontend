import React from 'react';

import { Button, TextInput, Tooltip } from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import { useAppDispatch } from '@/store/hooks';
import { FilesystemPartition, removePartition } from '@/store/slices/wizard';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import SizeUnit from './SizeUnit';

export const FileSystemContext = React.createContext<boolean>(true);

type RowPropTypes = {
  partition: FilesystemPartition;
  isRemovingDisabled: boolean;
  isOscapRequired: boolean;
  oscapMinSizeLabel: string;
};

const Row = ({
  partition,
  isRemovingDisabled,
  isOscapRequired,
  oscapMinSizeLabel,
}: RowPropTypes) => {
  const dispatch = useAppDispatch();

  const handleRemovePartition = (id: string) => {
    dispatch(removePartition(id));
  };

  const customization = 'fileSystem';

  const removeButton = (
    <Button
      isDisabled={isOscapRequired || isRemovingDisabled}
      variant='plain'
      icon={isOscapRequired ? <LockIcon /> : <MinusCircleIcon />}
      onClick={() => handleRemovePartition(partition.id)}
      aria-label='Remove partition'
    />
  );

  return (
    <Tr id={partition.id}>
      <Td width={40}>
        <Mountpoint
          partition={partition}
          customization={customization}
          isOscapRequired={isOscapRequired}
        />
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
        <MinimumSize
          partition={partition}
          customization={customization}
          isOscapRequired={isOscapRequired}
          oscapMinSizeLabel={oscapMinSizeLabel}
        />
      </Td>
      <Td width={20}>
        <SizeUnit
          partition={partition}
          customization={customization}
          isOscapRequired={isOscapRequired}
        />
      </Td>
      <Td isActionCell>
        {isOscapRequired ? (
          <Tooltip content='Required by the selected OpenSCAP profile'>
            <span>{removeButton}</span>
          </Tooltip>
        ) : (
          removeButton
        )}
      </Td>
    </Tr>
  );
};

export default Row;
