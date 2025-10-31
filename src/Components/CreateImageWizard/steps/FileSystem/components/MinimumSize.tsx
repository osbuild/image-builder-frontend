import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  changePartitionMinSize,
  changePartitionUnit,
} from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import {
  FilesystemPartition,
  LogicalVolumeWithBase,
  VolumeGroupWithExtendedLV,
} from '../fscTypes';

type MinimumSizePropTypes = {
  partition:
    | FilesystemPartition
    | LogicalVolumeWithBase
    | VolumeGroupWithExtendedLV;
  customization: 'disk' | 'fileSystem';
};

const MinimumSize = ({ partition, customization }: MinimumSizePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='minimum partition size'
      value={partition.min_size || ''}
      isDisabled={partition.unit === 'B'}
      warning={
        partition.unit === 'B'
          ? 'The Wizard only supports KiB, MiB, or GiB. Adjust or keep the current value.'
          : ''
      }
      type='text'
      placeholder='Define minimum size'
      stepValidation={stepValidation}
      fieldName={`min-size-${partition.id}`}
      onChange={(event, minSize) => {
        if (minSize === '' || /^\d+$/.test(minSize)) {
          dispatch(
            changePartitionMinSize({
              id: partition.id,
              min_size: minSize,
              customization: customization,
            }),
          );
          dispatch(
            changePartitionUnit({
              id: partition.id,
              unit: partition.unit || 'GiB',
              customization: customization,
            }),
          );
        }
      }}
    />
  );
};

export default MinimumSize;
