import React from 'react';

import { TextInput } from '@patternfly/react-core';

import { useAppDispatch } from '../../../../../store/hooks';
import { VolumeGroup } from '../../../../../store/imageBuilderApi';
import { changePartitionName } from '../../../../../store/wizardSlice';
import { FscDiskPartitionBase, LogicalVolumeWithBase } from '../fscTypes';

type PartitionNamePropTypes = {
  partition: (VolumeGroup & FscDiskPartitionBase) | LogicalVolumeWithBase;
  customization: 'disk' | 'fileSystem';
};

const PartitionName = ({
  partition,
  customization,
}: PartitionNamePropTypes) => {
  const dispatch = useAppDispatch();

  return (
    <TextInput
      aria-label='Partition name input'
      value={partition.name || ''}
      type='text'
      onChange={(event, name) => {
        dispatch(
          changePartitionName({
            id: partition.id,
            name: name,
            customization: customization,
          }),
        );
      }}
    />
  );
};

export default PartitionName;
