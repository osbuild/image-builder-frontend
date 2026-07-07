import React from 'react';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/CreateImageWizard/ValidatedInput';
import { VolumeGroup } from '@/store/api/backend';
import { useAppDispatch } from '@/store/hooks';
import {
  changePartitionName,
  DiskPartitionBase,
  LogicalVolumeWithBase,
  PartitioningCustomization,
} from '@/store/slices/wizard';

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
