import React from 'react';

import { VolumeGroup } from '@/store/api/backend';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionName } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import {
  DiskPartitionBase,
  LogicalVolumeWithBase,
  PartitioningCustomization,
} from '../fscTypes';

type PartitionNamePropTypes = {
  partition: (VolumeGroup & DiskPartitionBase) | LogicalVolumeWithBase;
  customization: PartitioningCustomization;
};

const PartitionName = ({
  partition,
  customization,
}: PartitionNamePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Partition name input'
      value={partition.name || ''}
      onChange={(event, name) => {
        dispatch(
          changePartitionName({
            id: partition.id,
            name: name,
            customization: customization,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`name-${partition.id}`}
    />
  );
};

export default PartitionName;
