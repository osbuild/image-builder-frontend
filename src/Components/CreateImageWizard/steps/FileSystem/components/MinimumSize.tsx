import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import {
  changePartitionMinSize,
  changePartitionUnit,
} from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { FilesystemPartition } from '../fscTypes';

type MinimumSizePropTypes = {
  partition: FilesystemPartition;
};

const MinimumSize = ({ partition }: MinimumSizePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='minimum partition size'
      value={partition.min_size}
      isDisabled={partition.unit === 'B'}
      warning={
        partition.unit === 'B'
          ? 'The Wizard only supports KiB, MiB, or GiB. Adjust or keep the current value.'
          : ''
      }
      type='text'
      stepValidation={stepValidation}
      fieldName={`min-size-${partition.id}`}
      placeholder='File system'
      onChange={(event, minSize) => {
        if (minSize === '' || /^\d+$/.test(minSize)) {
          dispatch(
            changePartitionMinSize({
              id: partition.id,
              min_size: minSize,
            }),
          );
          dispatch(
            changePartitionUnit({ id: partition.id, unit: partition.unit }),
          );
        }
      }}
    />
  );
};

export default MinimumSize;
