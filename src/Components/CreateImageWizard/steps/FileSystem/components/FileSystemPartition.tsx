import React from 'react';

import { FormGroup, Label, Radio } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeFscMode,
  selectComplianceProfileID,
  selectFscMode,
} from '../../../../../store/wizardSlice';

const FileSystemPartition = () => {
  const dispatch = useAppDispatch();
  const fscMode = useAppSelector(selectFscMode);
  const hasOscapProfile = useAppSelector(selectComplianceProfileID);

  if (hasOscapProfile) {
    return undefined;
  }

  return (
    <FormGroup>
      <Radio
        id='automatic file system config radio'
        label={
          <>
            <Label isCompact color='blue'>
              Recommended
            </Label>{' '}
            Use automatic partitioning
          </>
        }
        name='sc-radio-automatic'
        description='Automatically partition your image to what is best, depending on the target environment(s)'
        isChecked={fscMode === 'automatic'}
        onChange={() => {
          dispatch(changeFscMode('automatic'));
        }}
      />
      <Radio
        id='manual file system config radio'
        label='Manually configure partitions'
        name='fsc-radio-manual'
        description='Manually configure the file system of your image by adding, removing, and editing partitions'
        isChecked={fscMode === 'basic'}
        onChange={() => {
          dispatch(changeFscMode('basic'));
        }}
      />
    </FormGroup>
  );
};

export default FileSystemPartition;
