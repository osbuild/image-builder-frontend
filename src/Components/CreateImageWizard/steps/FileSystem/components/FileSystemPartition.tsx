import React from 'react';

import { FormGroup, Label, Radio } from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeFscMode,
  selectComplianceProfileID,
  selectDiskPartitions,
  selectFscMode,
} from '../../../../../store/wizardSlice';

const FileSystemPartition = () => {
  const dispatch = useAppDispatch();
  const fscMode = useAppSelector(selectFscMode);
  const hasOscapProfile = useAppSelector(selectComplianceProfileID);

  const isAdvancedPartitioningEnabled = useFlag(
    'image-builder.advanced-partitioning.enabled',
  );
  const hasDiskCustomization = useAppSelector(selectDiskPartitions).length > 0;

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
        name='fsc-automatic-radio'
        description='Automatically partition your image to what is best, depending on the target environment(s)'
        isChecked={fscMode === 'automatic'}
        onChange={() => {
          dispatch(changeFscMode('automatic'));
        }}
      />
      <Radio
        id='basic-partitioning-radio'
        label={
          isAdvancedPartitioningEnabled && hasDiskCustomization
            ? 'Basic filesystem partitioning'
            : 'Manually configure partitions'
        }
        name='fsc-basic-radio'
        description='Manually configure the file system of your image by adding, removing, and editing partitions'
        isChecked={fscMode === 'basic'}
        onChange={() => {
          dispatch(changeFscMode('basic'));
        }}
      />
      {isAdvancedPartitioningEnabled && hasDiskCustomization && (
        <Radio
          id='advanced-partitioning-radio'
          label='Advanced disk partitioning'
          name='fsc-advanced-radio'
          description='Configure disk partitioning with advanced options'
          isChecked={fscMode === 'advanced'}
          onChange={() => {
            dispatch(changeFscMode('advanced'));
          }}
        />
      )}
    </FormGroup>
  );
};

export default FileSystemPartition;
