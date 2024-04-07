import React from 'react';

import { FormGroup, Label, Radio } from '@patternfly/react-core';
import { v4 as uuidv4 } from 'uuid';

import { UNIT_GIB } from '../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeFileSystemConfiguration,
  changeFileSystemPartitionMode,
  selectFileSystemPartitionMode,
} from '../../../../store/wizardSlice';

const FileSystemPartition = () => {
  const id = uuidv4();
  const dispatch = useAppDispatch();
  const fileSystemPartitionMode = useAppSelector(selectFileSystemPartitionMode);
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
          dispatch(changeFileSystemConfiguration([]));
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
          dispatch(
            changeFileSystemConfiguration([
              {
                id: id,
                mountpoint: '/',
                min_size: (10 * UNIT_GIB).toString(),
                unit: 'GiB',
              },
            ])
          );
        }}
      />
    </FormGroup>
  );
};

export default FileSystemPartition;
