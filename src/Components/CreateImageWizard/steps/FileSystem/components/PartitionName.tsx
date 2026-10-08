import React from 'react';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { VolumeGroup } from '@/store/api/backend';
import { useAppDispatch } from '@/store/hooks';
import {
  changePartitionName,
  DiskPartitionBase,
  LogicalVolumeWithBase,
} from '@/store/slices/wizard';

type PartitionNamePropTypes = {
  partition: (VolumeGroup & DiskPartitionBase) | LogicalVolumeWithBase;
};

const PartitionName = ({ partition }: PartitionNamePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Partition name input'
      value={partition.name || ''}
      onChange={(_, name) => {
        dispatch(
          changePartitionName({
            id: partition.id,
            name: name,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`name-${partition.id}`}
    />
  );
};

export default PartitionName;
