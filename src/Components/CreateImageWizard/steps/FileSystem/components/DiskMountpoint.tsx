import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionMountpoint } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import {
  LogicalVolumeWithBase,
  PartitioningCustomization,
  PlainPartitionWithBase,
} from '../fscTypes';

type DiskMountpointProps = {
  partition: PlainPartitionWithBase | LogicalVolumeWithBase;
  customization: PartitioningCustomization;
};

const DiskMountpoint = ({ partition, customization }: DiskMountpointProps) => {
  const dispatch = useAppDispatch();
  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Mount point input'
      placeholder='Define mount point'
      value={partition.mountpoint || ''}
      isDisabled={partition.fs_type === 'swap'}
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
};

export default DiskMountpoint;
