import React, { useEffect, useState } from 'react';

import {
  Content,
  FormGroup,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { BuildIcon, RepositoryIcon } from '@patternfly/react-icons';

import { RHEL_10 } from '../../../../../constants';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { Distributions } from '../../../../../store/imageBuilderApi';
import { asDistribution } from '../../../../../store/typeGuards';
import {
  changeBlueprintMode,
  changeDistribution,
  selectIsImageMode,
} from '../../../../../store/wizardSlice';
import { getHostDistro } from '../../../../../Utilities/getHostInfo';

const BlueprintMode = () => {
  const dispatch = useAppDispatch();
  const isImageMode = useAppSelector(selectIsImageMode);
  const [defaultDistro, setDefaultDistro] = useState<Distributions>(RHEL_10);

  useEffect(() => {
    const fetchDefaultDistro = async () => {
      try {
        const distro = await getHostDistro();
        setDefaultDistro(asDistribution(distro as Distributions));
      } catch {
        // defaultDistro remains RHEL_10
        // this is fine since image-mode is
        // limited to RHEL_10 for now
      }
    };

    fetchDefaultDistro();
  }, []);

  return (
    <FormGroup label='Image type' isRequired>
      <ToggleGroup aria-label='Blueprint mode toggle group'>
        <ToggleGroupItem
          icon={<RepositoryIcon />}
          text='Package mode'
          buttonId='blueprint-mode-package'
          isSelected={!isImageMode}
          onChange={() => {
            dispatch(changeBlueprintMode('package'));
            dispatch(changeDistribution(defaultDistro));
          }}
          aria-describedby='blueprint-mode-description'
        />
        <ToggleGroupItem
          icon={<BuildIcon />}
          text='Image mode'
          buttonId='blueprint-mode-image'
          isSelected={isImageMode}
          onChange={() => {
            dispatch(changeBlueprintMode('image'));
            dispatch(changeDistribution('image-mode'));
          }}
          aria-describedby='blueprint-mode-description'
        />
      </ToggleGroup>
      <Content
        id='blueprint-mode-description'
        className='pf-v6-u-pt-sm pf-v6-u-text-color-subtle'
      >
        {!isImageMode &&
          'RHEL in package mode is a system managed by individually installing and updating software packages'}
        {isImageMode &&
          'RHEL image mode treats the entire operating system as a single, immutable container image that is updated atomically'}
      </Content>
    </FormGroup>
  );
};

export default BlueprintMode;
