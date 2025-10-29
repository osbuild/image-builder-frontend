import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import { VolumeGroup } from '../../../../../store/imageBuilderApi';
import { changePartitionName } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
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
      fieldName={`lvname-${partition.id}`}
    />
  );
};

export default PartitionName;
