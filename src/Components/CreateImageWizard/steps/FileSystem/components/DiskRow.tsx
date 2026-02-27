import React from 'react';

import { Button } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { Td, Tr } from '@patternfly/react-table';

import MinimumSize from './MinimumSize';
import Mountpoint from './Mountpoint';
import PartitionName from './PartitionName';
import PartitionType from './PartitionType';
import SizeUnit from './SizeUnit';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  removeDiskPartition,
  selectDiskPartitions,
} from '../../../../../store/wizardSlice';
import { DiskPartition } from '../fscTypes';

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
    <Tr id={partition.id}>
      {partition.type !== 'plain' && (
        <Td className='pf-m-width-20'>
          <PartitionName partition={partition} customization={customization} />
        </Td>
      )}
      <Td width={20}>
        <Mountpoint partition={partition} customization={customization} />
      </Td>
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
          // there needs to be at least one logical volume in a volume group
          // this disables the "remove partition" button until another volume is added
          isDisabled={diskPartitions.some(
            (vg) =>
              vg.type === 'lvm' &&
              vg.logical_volumes.length === 1 &&
              vg.logical_volumes.some((lv) => lv.id === partition.id),
          )}
        />
      </Td>
    </Tr>
  );
};

export default DiskRow;
