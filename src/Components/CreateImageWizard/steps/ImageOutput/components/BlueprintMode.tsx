import React, { useEffect, useRef, useState } from 'react';

import {
  Content,
  FormGroup,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { BuildIcon, RepositoryIcon } from '@patternfly/react-icons';

import { RHEL_10, RHEL_10_IMAGE_MODE_IMAGE, X86_64 } from '@/constants';
import { Distributions } from '@/store/api/backend';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeArchitecture,
  changeBlueprintMode,
  changeDistribution,
  changeImageSource,
  changeImageTypes,
  selectArchitecture,
  selectDistribution,
  selectIsImageMode,
} from '@/store/slices/wizard';
import { asDistribution } from '@/store/typeGuards';
import { getHostDistro } from '@/Utilities/getHostInfo';

const BlueprintMode = () => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const distribution = useAppSelector(selectDistribution);
  const architecture = useAppSelector(selectArchitecture);
  const [defaultDistro, setDefaultDistro] = useState<Distributions>(RHEL_10);
  const previousDistro = useRef<Distributions>(RHEL_10);
  const previousArch = useRef(architecture);

  useEffect(() => {
    if (!isOnPremise) return;
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
  }, [isOnPremise]);

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
            dispatch(
              changeDistribution(
                isOnPremise ? defaultDistro : previousDistro.current,
              ),
            );
            // Image source is only relevant in image mode
            dispatch(changeImageSource(undefined));
            if (!isOnPremise) {
              dispatch(changeArchitecture(previousArch.current));
            }
          }}
          aria-describedby='blueprint-mode-description'
        />
        <ToggleGroupItem
          icon={<BuildIcon />}
          text='Image mode'
          buttonId='blueprint-mode-image'
          isSelected={isImageMode}
          onChange={() => {
            if (!isOnPremise) {
              previousDistro.current = distribution as Distributions;
              previousArch.current = architecture;
            }
            dispatch(changeBlueprintMode('image'));
            dispatch(changeImageTypes([]));
            if (isOnPremise) {
              dispatch(changeDistribution('image-mode'));
            } else {
              dispatch(changeArchitecture(X86_64));
              dispatch(changeImageSource(RHEL_10_IMAGE_MODE_IMAGE));
            }
          }}
          aria-describedby='blueprint-mode-description'
        />
      </ToggleGroup>
      <Content
        id='blueprint-mode-description'
        className='pf-v6-u-pt-sm pf-v6-u-text-color-subtle'
      >
        {!isImageMode &&
          'RHEL in package mode is a system managed by individually installing and updating software packages.'}
        {isImageMode &&
          'RHEL image mode treats the entire operating system as a single, immutable container image that is updated atomically'}
      </Content>
    </FormGroup>
  );
};

export default BlueprintMode;
