import React from 'react';

import {
  Content,
  FormGroup,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { BuildIcon, RepositoryIcon } from '@patternfly/react-icons';

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
      <ToggleGroup aria-label='Blueprint mode toggle group'>
        <ToggleGroupItem
          icon={<RepositoryIcon />}
          text='Package mode'
          buttonId='blueprint-mode-package'
          isSelected={blueprintMode === 'package'}
          onChange={() => {
            dispatch(changeBlueprintMode('package'));
          }}
          aria-describedby='blueprint-mode-description'
        />
        <ToggleGroupItem
          icon={<BuildIcon />}
          text='Image mode'
          buttonId='blueprint-mode-image'
          isSelected={blueprintMode === 'image'}
          onChange={() => {
            dispatch(changeBlueprintMode('image'));
          }}
          aria-describedby='blueprint-mode-description'
        />
      </ToggleGroup>
      <Content
        id='blueprint-mode-description'
        className='pf-v6-u-pt-sm pf-v6-u-text-color-subtle'
      >
        {blueprintMode === 'package' &&
          'RHEL in package mode is a system managed by individually installing and updating software packages'}
        {blueprintMode === 'image' &&
          'RHEL image mode treats the entire operating system as a single, immutable container image that is updated atomically'}
      </Content>
    </FormGroup>
  );
};

export default BlueprintMode;
