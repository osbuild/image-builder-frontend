import React, { useEffect, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';

import { ValidatedTextInput } from '@/Components/ValidatedInputs';
import { useSecuritySummary } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import {
  changePartitionMinSize,
  type Partition,
  selectBlueprintMode,
  validateRequiredMinsize,
} from '@/store/slices/wizard';

type MinimumSizeProps = {
  partition: Partition;
  isOscapRequired?: boolean;
  oscapMinSizeLabel?: string;
};

const MinimumSize = ({
  partition,
  isOscapRequired,
  oscapMinSizeLabel,
}: MinimumSizeProps) => {
  const dispatch = useAppDispatch();
  const [minsize, setMinsize] = useState(partition.min_size);
  const complianceType = useAppSelector(selectComplianceType);
  const blueprintMode = useAppSelector(selectBlueprintMode);
  const { filesystem: requiredFilesystem } = useSecuritySummary();

  useEffect(() => {
    // Reset the minsize when the partition changes externally.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinsize(partition.min_size);
  }, [partition.min_size]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    event.currentTarget.blur();
  };

  const sizeInput = (
    <ValidatedTextInput
      id={`min-size-${partition.id}`}
      ariaLabel='minimum partition size'
      placeholder='Define minimum size'
      inputProps={{ onKeyDown: handleKeyDown }}
      value={minsize}
      isDisabled={partition.unit === 'B'}
      onChange={(_, value) => setMinsize(value)}
      validator={(value) =>
        validateRequiredMinsize(
          {
            ...partition,
            min_size: value,
          },
          requiredFilesystem,
          blueprintMode,
        )
      }
      onCommit={(candidate) => {
        if (!candidate) return;

        dispatch(
          changePartitionMinSize({
            id: partition.id,
            min_size: candidate,
          }),
        );
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
