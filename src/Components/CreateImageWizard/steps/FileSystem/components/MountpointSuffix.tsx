import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionMountpoint } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { FilesystemPartition, PartitioningCustomization } from '../fscTypes';
import { getPrefix, getSubpath, normalizeSubpath } from '../fscUtilities';

type MountpointSubpathPropTypes = {
  partition: FilesystemPartition;
  customization: PartitioningCustomization;
};

const MountpointSubpath = ({
  partition,
  customization,
}: MountpointSubpathPropTypes) => {
  const dispatch = useAppDispatch();
  const prefix = getPrefix(partition.mountpoint);
  const subpath = getSubpath(partition.mountpoint);

  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Mountpoint subpath'
      placeholder='Define mountpoint subpath'
      value={subpath}
      onChange={(event: React.FormEvent, newValue) => {
        const mountpoint = prefix + normalizeSubpath(newValue);
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
            customization: customization,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`mountpoint-subpath-${partition.id}`}
    />
  );
};

export default MountpointSubpath;
