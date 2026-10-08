import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import {
  changePartitionMinSize,
  changePartitionUnit,
  DiskPartitionBase,
  FilesystemPartition,
} from '@/store/slices/wizard';

type MinimumSizeProps = {
  partition: FilesystemPartition | DiskPartitionBase;
  isOscapRequired?: boolean;
  oscapMinSizeLabel?: string;
};

const MinimumSize = ({
  partition,
  isOscapRequired,
  oscapMinSizeLabel,
}: MinimumSizeProps) => {
  const dispatch = useAppDispatch();
  const complianceType = useAppSelector(selectComplianceType);
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
      onChange={(_, minSize) => {
        if (minSize === '' || /^\d+$/.test(minSize)) {
          dispatch(
            changePartitionMinSize({
              id: partition.id,
              min_size: minSize,
            }),
          );
          dispatch(
            changePartitionUnit({
              id: partition.id,
              unit: partition.unit || 'GiB',
            }),
          );
        }
      }}
    />
  );

  if (isOscapRequired && oscapMinSizeLabel) {
    return (
      <Tooltip
        content={`Minimum ${oscapMinSizeLabel} required by the selected ${complianceType === 'openscap' ? 'OpenSCAP profile' : 'compliance policy'}`}
      >
        <div>{sizeInput}</div>
      </Tooltip>
    );
  }

  return sizeInput;
};

export default MinimumSize;
