import React, { useEffect } from 'react';

import { Content, Form, FormGroup, Title } from '@patternfly/react-core';

import DocumentationButton from '@/Components/sharedComponents/DocumentationButton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';
import {
  changeArchitecture,
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
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
  const isImageModeEnabled = useFlag('image-builder.image-mode.enabled');
  const isHostedImageMode = isImageMode && !isOnPremise;

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

  return (
    <Form>
      <Title headingLevel='h1' size='xl' id='image-output-section'>
        Image output
      </Title>
      <Content>
        Select the release, architecture, and a target environment to build your
        image. Learn more about <DocumentationButton />
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
      {isHostedImageMode ? (
        <FormGroup label='Architecture'>x86_64</FormGroup>
      ) : (
        <ArchSelect />
      )}
      <TargetEnvironment />
    </Form>
  );
};

export default ImageOutputStep;
