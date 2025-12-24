import React from 'react';

import { Content, FormGroup, Radio } from '@patternfly/react-core';

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
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='automatic file system config radio'
          label='Use automatic partitioning'
          name='fsc-type'
          description='Automatically partition your image to what is best, depending on the target environment(s)'
          isChecked={fscMode === 'automatic'}
          onChange={() => {
            dispatch(changeFscMode('automatic'));
          }}
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='basic-partitioning-radio'
          label='Basic filesystem partitioning'
          name='fsc-type'
          description='Configure the file system of your image by adding, removing, and editing partitions'
          isChecked={fscMode === 'basic'}
          onChange={() => {
            dispatch(changeFscMode('basic'));
          }}
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='advanced-partitioning-radio'
          label='Advanced disk partitioning'
          name='fsc-type'
          description='Configure disk partitioning with advanced options'
          isChecked={fscMode === 'advanced'}
          onChange={() => {
            dispatch(changeFscMode('advanced'));
          }}
        />
      </Content>
    </FormGroup>
  );
};

export default FileSystemPartition;
