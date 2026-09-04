import React from 'react';

import {
  Button,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  TextInput,
  Tooltip,
} from '@patternfly/react-core';
import { LockIcon, MinusCircleIcon } from '@patternfly/react-icons';

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
      icon={
        isOscapRequired || isRemovingDisabled ? (
          <LockIcon />
        ) : (
          <MinusCircleIcon />
        )
      }
      onClick={() => handleRemovePartition(partition.id)}
      aria-label='Remove partition'
    />
  );

  return (
    <Flex
      role='row'
      id={partition.id}
      data-testid={`partition-row-${partition.id}`}
      alignItems={{ default: 'alignItemsFlexStart' }}
      className='pf-v6-u-pb-sm'
    >
      <FlexItem role='cell' style={{ flex: '0 0 40%' }}>
        <Mountpoint
          partition={partition}
          customization={customization}
          isOscapRequired={isOscapRequired}
        />
      </FlexItem>
      <FlexItem role='cell' style={{ flex: '0 0 20%' }}>
        <TextInput
          value='xfs'
          type='text'
          aria-label='Partition type'
          isDisabled
        />
      </FlexItem>
      <FlexItem role='cell' style={{ flex: '1 1 auto' }}>
        <Split hasGutter>
          <SplitItem isFilled>
            <MinimumSize
              partition={partition}
              customization={customization}
              isOscapRequired={isOscapRequired}
              oscapMinSizeLabel={oscapMinSizeLabel}
            />
          </SplitItem>
          <SplitItem>
            <SizeUnit
              partition={partition}
              customization={customization}
              isOscapRequired={isOscapRequired}
            />
          </SplitItem>
        </Split>
      </FlexItem>
      <FlexItem role='cell' style={{ flex: '0 0 auto' }}>
        {isOscapRequired || isRemovingDisabled ? (
          <Tooltip
            content={
              isOscapRequired
                ? 'Required by the selected OpenSCAP profile'
                : 'Root partition is required'
            }
          >
            <span>{removeButton}</span>
          </Tooltip>
        ) : (
          removeButton
        )}
      </FlexItem>
    </Flex>
  );
};

export default Row;
