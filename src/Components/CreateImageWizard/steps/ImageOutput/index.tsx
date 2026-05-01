import React, { useEffect } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import DocumentationButton from '@/Components/sharedComponents/DocumentationButton';
import { RHEL_10_IMAGE_MODE_IMAGE } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeArchitecture,
  changeBlueprintName,
  changeImageSource,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
  selectImageSource,
  selectIsCustomName,
  selectIsImageMode,
} from '@/store/slices/wizard';
import { useFlag } from '@/Utilities/useGetEnvironment';

import ArchSelect from './components/ArchSelect';
import BlueprintMode from './components/BlueprintMode';
import CentOSAcknowledgement from './components/CentOSAcknowledgement';
import ImageSourceSelect from './components/ImageSourceSelect';
import ReleaseLifecycle from './components/ReleaseLifecycle';
import ReleaseSelect from './components/ReleaseSelect';
import TargetEnvironment from './components/TargetEnvironment';

import { generateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const dispatch = useAppDispatch();
  const isImageMode = useAppSelector(selectIsImageMode);
  const blueprintName = useAppSelector(selectBlueprintName);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isCustomName = useAppSelector(selectIsCustomName);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const imageSource = useAppSelector(selectImageSource);
  const isImageModeEnabled = useFlag('image-builder.image-mode.enabled');
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const isHostedImageMode = isImageMode && !isOnPremise;

  const Wrapper = isWizardRevampEnabled ? React.Fragment : Form;

  useEffect(() => {
    const defaultName = generateDefaultName(distribution, arch);
    if (!isCustomName && blueprintName !== defaultName) {
      dispatch(changeBlueprintName(defaultName));
    }
  }, [dispatch, distribution, arch, isCustomName]);

  useEffect(() => {
    if (isHostedImageMode) {
      dispatch(changeArchitecture('x86_64'));
    }
  }, [dispatch, isHostedImageMode]);

  useEffect(() => {
    if (!isHostedImageMode) return;
    if (imageSource) return;
    dispatch(changeImageSource(RHEL_10_IMAGE_MODE_IMAGE));
  }, [dispatch, imageSource, isHostedImageMode]);

  return (
    <Wrapper>
      <Content>
        <Title
          headingLevel={isWizardRevampEnabled ? 'h2' : 'h1'}
          size={isWizardRevampEnabled ? 'lg' : 'xl'}
          id='image-output-section'
        >
          Image output
        </Title>
        <Content component={isWizardRevampEnabled ? 'small' : 'p'}>
          Select the release, architecture, and a target environment to build
          your image.{' '}
          {!isImageMode &&
            'Select any number of target environments to simultaneously build this image from. '}
          Learn more about <DocumentationButton />.
        </Content>
      </Content>
      {isImageModeEnabled && !(distribution as string).startsWith('fedora') && (
        <BlueprintMode />
      )}
      {isImageModeEnabled && isImageMode && <ImageSourceSelect />}
      {!isImageMode && (
        <>
          <ReleaseSelect />
          {distribution.match('centos-*') && <CentOSAcknowledgement />}
          <ReleaseLifecycle />
        </>
      )}
      <ArchSelect isDisabled={isHostedImageMode} />
      <TargetEnvironment />
    </Wrapper>
  );
};

export default ImageOutputStep;
