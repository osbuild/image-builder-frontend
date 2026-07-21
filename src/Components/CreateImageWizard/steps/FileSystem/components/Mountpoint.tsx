import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useFilesystemValidation } from '@/Components/CreateImageWizard/utilities/useValidation';
import { ValidatedInputAndTextArea } from '@/Components/CreateImageWizard/ValidatedInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  changePartitionMountpoint,
  FilesystemPartition,
  LogicalVolumeWithBase,
  PartitioningCustomization,
  PlainPartitionWithBase,
  selectFilesystemPartitions,
} from '@/store/slices/wizard';

type MountpointProps = {
  partition:
    FilesystemPartition | PlainPartitionWithBase | LogicalVolumeWithBase;
  customization: PartitioningCustomization;
  isOscapRequired?: boolean;
};

const Mountpoint = ({
  partition,
  customization,
  isOscapRequired,
}: MountpointProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);

  const hasOneRoot =
    customization === 'fileSystem' &&
    partition.mountpoint === '/' &&
    filesystemPartitions.filter((p) => p.mountpoint === '/').length === 1;

  const isDisabled =
    isOscapRequired ||
    ('fs_type' in partition && partition.fs_type === 'swap') ||
    hasOneRoot;

  const tooltipContent = isOscapRequired
    ? 'Required by the selected OpenSCAP profile'
    : 'Root partition is required';

  const mountpointInput = (
    <ValidatedInputAndTextArea
      ariaLabel='Mount point input'
      placeholder='Define mount point'
      value={partition.mountpoint || ''}
      isDisabled={isDisabled}
      onChange={(event, mountpoint) => {
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
            customization: customization,
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
