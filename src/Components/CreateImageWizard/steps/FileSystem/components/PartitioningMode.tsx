import React from 'react';

import { Content, Radio } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changePartitioningMode,
  selectPartitioningMode,
} from '../../../../../store/wizardSlice';

const PartitioningMode = () => {
  const dispatch = useAppDispatch();
  const partitioningMode = useAppSelector(selectPartitioningMode);

  return (
    <>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='auto-lvm-partitioning-mode-radio'
          label='Auto-LVM partitioning'
          name='partitioning-mode'
          description='Converts partitions to LVM only if new mountpoints are defined in the filesystem customization'
          isChecked={partitioningMode === 'auto-lvm'}
          onChange={() => {
            dispatch(changePartitioningMode('auto-lvm'));
          }}
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='raw-partitioning-mode-radio'
          label='Raw partitioning'
          name='partitioning-mode'
          description='Will not convert any partition to LVM or Btrfs'
          isChecked={partitioningMode === 'raw'}
          onChange={() => {
            dispatch(changePartitioningMode('raw'));
          }}
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='lvm-partitioning-mode-radio'
          label='LVM partitioning'
          name='partitioning-mode'
          description='Converts the partition that contains the root mountpoint / to an LVM Volume Group and creates a root Logical Volume. Any extra mountpoints, except /boot, will be added to the Volume Group as new Logical Volumes'
          isChecked={partitioningMode === 'lvm'}
          onChange={() => {
            dispatch(changePartitioningMode('lvm'));
          }}
        />
      </Content>
    </>
  );
};

export default PartitioningMode;
