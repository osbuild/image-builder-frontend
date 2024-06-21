import React from 'react';

import { FormGroup } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import { Radio } from '@patternfly/react-core/dist/dynamic/components/Radio';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeFileSystemPartitionMode,
  selectFileSystemPartitionMode,
  selectProfile,
} from '../../../../store/wizardSlice';

const FileSystemPartition = () => {
  const dispatch = useAppDispatch();
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);
  const hasOscapProfile = useAppSelector(selectProfile);

  if (hasOscapProfile) {
    return undefined;
  }

  return (
    <FormGroup>
      <Radio
        id="automatic file system config radio"
        ouiaId="automatic-configure-fsc-radio"
        label={
          <>
            <Label isCompact color="blue">
              Recommended
            </Label>{' '}
            Use automatic partitioning
          </>
        }
        name="sc-radio-automatic"
        description="Automatically partition your image to what is best, depending on the target environment(s)"
        isChecked={fileSystemPartitionMode === 'automatic'}
        onChange={() => {
          dispatch(changeFileSystemPartitionMode('automatic'));
        }}
      />
      <Radio
        id="manual file system config radio"
        ouiaId="manual-configure-fsc-radio"
        label="Manually configure partitions"
        name="fsc-radio-manual"
        description="Manually configure the file system of your image by adding, removing, and editing partitions"
        isChecked={fileSystemPartitionMode === 'manual'}
        onChange={() => {
          dispatch(changeFileSystemPartitionMode('manual'));
        }}
      />
    </FormGroup>
  );
};

export default FileSystemPartition;
