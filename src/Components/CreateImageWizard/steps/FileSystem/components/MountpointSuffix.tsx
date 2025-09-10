import React from 'react';

import { TextInput } from '@patternfly/react-core';

import { useAppDispatch } from '../../../../../store/hooks';
import { changePartitionMountpoint } from '../../../../../store/wizardSlice';
import { FilesystemPartition } from '../fscTypes';
import { getPrefix, getSuffix, normalizeSuffix } from '../fscUtilities';

type MountpointSuffixPropTypes = {
  partition: FilesystemPartition;
};

const MountpointSuffix = ({ partition }: MountpointSuffixPropTypes) => {
  const dispatch = useAppDispatch();
  const prefix = getPrefix(partition.mountpoint);
  const suffix = getSuffix(partition.mountpoint);

  return (
    <TextInput
      value={suffix}
      type='text'
      onChange={(event: React.FormEvent, newValue) => {
        const mountpoint = prefix + normalizeSuffix(newValue);
        dispatch(
          changePartitionMountpoint({
            id: partition.id,
            mountpoint: mountpoint,
          }),
        );
      }}
      aria-label='mountpoint suffix'
    />
  );
};

export default MountpointSuffix;
