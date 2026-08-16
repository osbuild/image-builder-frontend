import React from 'react';

import {
  Button,
  Flex,
  FlexItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  DiskPartition,
  removeDiskPartition,
  selectDiskPartitions,
} from '@/store/slices/wizard';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import PartitionName from './PartitionName';
import PartitionType from './PartitionType';
import SizeUnit from './SizeUnit';

type DiskRowPropTypes = {
  partition: DiskPartition;
};

const DiskRow = ({ partition }: DiskRowPropTypes) => {
  const dispatch = useAppDispatch();
  const diskPartitions = useAppSelector(selectDiskPartitions);

  const customization = 'disk';

  const handleRemovePartition = (id: string) => {
    dispatch(removeDiskPartition(id));
  };

  if (partition.type === 'lvm' || partition.type === 'btrfs') {
    return;
  }

  return (
    <Flex
      id={partition.id}
      data-testid={`partition-row-${partition.id}`}
      alignItems={{ default: 'alignItemsFlexStart' }}
      className='pf-v6-u-pb-sm'
    >
      {partition.type !== 'plain' && (
        <FlexItem style={{ flex: '0 0 25%' }}>
          <PartitionName partition={partition} customization={customization} />
        </FlexItem>
      )}
      <FlexItem
        style={{ flex: partition.type !== 'plain' ? '0 0 25%' : '0 0 30%' }}
      >
        <Mountpoint partition={partition} customization={customization} />
      </FlexItem>
      <FlexItem style={{ flex: '0 0 10%' }}>
        <PartitionType partition={partition} customization={customization} />
      </FlexItem>
      <FlexItem style={{ flex: '1 1 auto' }}>
        <Split hasGutter>
          <SplitItem isFilled>
            <MinimumSize partition={partition} customization={customization} />
          </SplitItem>
          <SplitItem>
            <SizeUnit partition={partition} customization={customization} />
          </SplitItem>
        </Split>
      </FlexItem>
      <FlexItem style={{ flex: '0 0 auto' }}>
        <Button
          variant='plain'
          icon={<MinusCircleIcon />}
          onClick={() => handleRemovePartition(partition.id)}
          isDisabled={diskPartitions.some(
            (vg) =>
              vg.type === 'lvm' &&
              vg.logical_volumes.length === 1 &&
              vg.logical_volumes.some((lv) => lv.id === partition.id),
          )}
          aria-label='Remove partition'
        />
      </FlexItem>
    </Flex>
  );
};

export default DiskRow;
