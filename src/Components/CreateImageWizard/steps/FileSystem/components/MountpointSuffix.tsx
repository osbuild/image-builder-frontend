import React from 'react';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionMountpoint } from '../../../../../store/wizardSlice';
import { useFilesystemValidation } from '../../../utilities/useValidation';
import { ValidatedInputAndTextArea } from '../../../ValidatedInput';
import { FilesystemPartition, PartitioningCustomization } from '../fscTypes';
import { getPrefix, getSuffix, normalizeSuffix } from '../fscUtilities';

type MountpointSuffixPropTypes = {
  partition: FilesystemPartition;
  customization: PartitioningCustomization;
};

const MountpointSuffix = ({
  partition,
  customization,
}: MountpointSuffixPropTypes) => {
  const dispatch = useAppDispatch();
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  const stepValidation = useFilesystemValidation();

  return (
    <ValidatedInputAndTextArea
      ariaLabel='Mountpoint subpath'
      placeholder='Define mountpoint subpath'
      value={suffix}
      onChange={(event: React.FormEvent, newValue) => {
        const mountpoint = prefix + normalizeSuffix(newValue);
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
            customization: customization,
          }),
        );
      }}
      stepValidation={stepValidation}
      fieldName={`mountpoint-suffix-${partition.id}`}
    />
  );
};

export default MountpointSuffix;
