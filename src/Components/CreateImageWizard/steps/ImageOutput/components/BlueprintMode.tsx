import React, { useEffect, useRef, useState } from 'react';

import {
  Content,
  FormGroup,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import { BuildIcon, RepositoryIcon } from '@patternfly/react-icons';

import { RHEL_10, RHEL_10_IMAGE_MODE_IMAGE, X86_64 } from '@/constants';
import { Distributions, getHostDistro } from '@/store/api/backend';
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

import './BlueprintMode.css';

const BlueprintMode = () => {
  const dispatch = useAppDispatch();
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const isImageMode = useAppSelector(selectIsImageMode);
  const distribution = useAppSelector(selectDistribution);
  const architecture = useAppSelector(selectArchitecture);
  // undefined until the host distro check resolves on-prem
  const [hostDistro, setHostDistro] = useState<Distributions | undefined>();
  const previousDistro = useRef<Distributions>(RHEL_10);
  const previousArch = useRef(architecture);

  useEffect(() => {
    if (!isOnPremise) return;
    const fetchHostDistro = async () => {
      try {
        const distro = await getHostDistro();
        setHostDistro(distro as Distributions);
      } catch {
        // Assume the default so a failed check doesn't lock image mode
        setHostDistro(RHEL_10);
      }
    };

    fetchHostDistro();
  }, [isOnPremise]);

  // On-prem builds run on the host itself, and image mode only ships
  // official RHEL 10 images for now. While the host distro is still
  // unknown the toggle stays disabled without the tooltip, so RHEL 10
  // users don't see a "coming soon" flash.
  const isHostDistroKnown = !isOnPremise || hostDistro !== undefined;
  const isImageModeSupported = !isOnPremise || hostDistro === RHEL_10;

  const imageModeToggle = (
    <ToggleGroupItem
      icon={<BuildIcon />}
      text='Image mode'
      buttonId='blueprint-mode-image'
      isSelected={isImageMode}
      isDisabled={!isImageModeSupported}
      onChange={() => {
        if (!isOnPremise) {
          previousDistro.current = distribution;
          previousArch.current = architecture;
        }
        dispatch(changeBlueprintMode('image'));
        dispatch(changeImageTypes([]));
        if (!isOnPremise) {
          dispatch(changeArchitecture(X86_64));
          dispatch(changeImageSource(RHEL_10_IMAGE_MODE_IMAGE));
        }
      }}
      aria-describedby='blueprint-mode-description'
    />
  );

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
                isOnPremise ? (hostDistro ?? RHEL_10) : previousDistro.current,
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
        {!isImageModeSupported && isHostDistroKnown ? (
          // Disabled buttons don't emit hover events, so the tooltip
          // needs a wrapper element as its trigger.
          <Tooltip content='Image mode is currently available only on RHEL 10 hosts. Support for CentOS Stream and Fedora is coming soon.'>
            <span
              className='image-mode-toggle-wrapper'
              data-testid='image-mode-toggle-wrapper'
            >
              {imageModeToggle}
            </span>
          </Tooltip>
        ) : (
          imageModeToggle
        )}
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
