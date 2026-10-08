import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/ValidatedInputs';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectComplianceType } from '@/store/slices';
import {
  changePartitionMountpoint,
  FilesystemPartition,
  LogicalVolumeWithBase,
  PlainPartitionWithBase,
  selectFilesystemPartitions,
  selectFscMode,
} from '@/store/slices/wizard';

type MountpointProps = {
  partition:
    FilesystemPartition | PlainPartitionWithBase | LogicalVolumeWithBase;
  isOscapRequired?: boolean;
};

const Mountpoint = ({ partition, isOscapRequired }: MountpointProps) => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectFscMode);
  const complianceType = useAppSelector(selectComplianceType);
  const stepValidation = useFilesystemValidation();
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);

  const hasOneRoot =
    mode === 'basic' &&
    partition.mountpoint === '/' &&
    filesystemPartitions.filter((p) => p.mountpoint === '/').length === 1;

  const isDisabled =
    isOscapRequired ||
    ('fs_type' in partition && partition.fs_type === 'swap') ||
    hasOneRoot;

  const tooltipContent = isOscapRequired
    ? complianceType === 'openscap'
      ? 'Required by the selected OpenSCAP profile'
      : 'Required by the selected compliance policy'
    : 'Root partition is required';

  const mountpointInput = (
    <ValidatedInputAndTextArea
      ariaLabel='Mount point input'
      placeholder='Define mount point'
      value={partition.mountpoint || ''}
      isDisabled={isDisabled}
      onChange={(_, mountpoint) => {
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`mountpoint-${partition.id}`}
    />
  );

  return isOscapRequired || hasOneRoot ? (
    <Tooltip content={tooltipContent}>
      <div>{mountpointInput}</div>
    </Tooltip>
  ) : (
    mountpointInput
  );
};

export default Mountpoint;
