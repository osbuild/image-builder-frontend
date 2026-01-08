import React from 'react';

import { Content, FormGroup, Radio } from '@patternfly/react-core';

import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import {
  changeBlueprintMode,
  selectBlueprintMode,
} from '../../../../../store/wizardSlice';

const BlueprintMode = () => {
  const dispatch = useAppDispatch();
  const blueprintMode = useAppSelector(selectBlueprintMode);

  return (
    <FormGroup label='Image type' isRequired>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='package-mode-radio'
          label='Package mode'
          name='blueprint-mode'
          description='RHEL in package mode is a system managed by individually installing and updating software packages'
          isChecked={blueprintMode === 'package'}
          onChange={() => {
            dispatch(changeBlueprintMode('package'));
          }}
        />
      </Content>
      <Content className='pf-v6-u-pb-sm'>
        <Radio
          id='image-mode-radio'
          label='Image mode'
          name='blueprint-mode'
          description='RHEL image mode treats the entire operating system as a single, immutable container image that is updated atomically'
          isChecked={blueprintMode === 'image'}
          onChange={() => {
            dispatch(changeBlueprintMode('image'));
          }}
        />
      </Content>
    </FormGroup>
  );
};

export default BlueprintMode;
