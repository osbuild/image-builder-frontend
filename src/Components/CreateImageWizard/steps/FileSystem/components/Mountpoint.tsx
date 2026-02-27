import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changePartitionMountpoint,
  selectFilesystemPartitions,
} from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import {
  FilesystemPartition,
  LogicalVolumeWithBase,
  PartitioningCustomization,
  PlainPartitionWithBase,
} from '../fscTypes';

type MountpointProps = {
  partition:
    | FilesystemPartition
    | PlainPartitionWithBase
    | LogicalVolumeWithBase;
  customization: PartitioningCustomization;
};

const Mountpoint = ({ partition, customization }: MountpointProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();
  const filesystemPartitions = useAppSelector(selectFilesystemPartitions);

  const hasOneRoot =
    customization === 'fileSystem' &&
    partition.mountpoint === '/' &&
    filesystemPartitions.filter((p) => p.mountpoint === '/').length === 1;

  const mountpointInput = (
    <ValidatedInputAndTextArea
      ariaLabel='Mount point input'
      placeholder='Define mount point'
      value={partition.mountpoint || ''}
      isDisabled={
        ('fs_type' in partition && partition.fs_type === 'swap') || hasOneRoot
      }
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

  return hasOneRoot ? (
    <Tooltip content='Root partition is required'>
      <div>{mountpointInput}</div>
    </Tooltip>
  ) : (
    mountpointInput
  );
};

export default Mountpoint;
