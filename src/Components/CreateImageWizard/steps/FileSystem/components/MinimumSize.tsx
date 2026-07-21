import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/CreateImageWizard/ValidatedInput';
import { useAppDispatch } from '@/store/hooks';
import {
  changePartitionMinSize,
  changePartitionUnit,
  FilesystemPartition,
  LogicalVolumeWithBase,
  PartitioningCustomization,
  VolumeGroupWithExtendedLV,
} from '@/store/slices/wizard';

type MinimumSizePropTypes = {
  partition:
    FilesystemPartition | LogicalVolumeWithBase | VolumeGroupWithExtendedLV;
  customization: PartitioningCustomization;
  isOscapRequired?: boolean;
  oscapMinSizeLabel?: string;
};

const MinimumSize = ({
  partition,
  customization,
  isOscapRequired,
  oscapMinSizeLabel,
}: MinimumSizePropTypes) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  const sizeInput = (
    <ValidatedInputAndTextArea
      ariaLabel='minimum partition size'
      value={partition.min_size || ''}
      isDisabled={partition.unit === 'B'}
      warning={
        partition.unit === 'B'
          ? 'The Wizard only supports MiB or GiB. Adjust or keep the current value.'
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

  if (isOscapRequired && oscapMinSizeLabel) {
    return (
      <Tooltip
        content={`Minimum ${oscapMinSizeLabel} required by the selected OpenSCAP profile`}
      >
        <div>{sizeInput}</div>
      </Tooltip>
    );
  }

  return sizeInput;
};

export default MinimumSize;
