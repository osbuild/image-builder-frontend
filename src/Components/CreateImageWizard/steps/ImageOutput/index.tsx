import React, { useEffect } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import {
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
  selectIsCustomName,
  selectIsImageMode,
} from '@/store/slices/wizard';

import ArchSelect from './components/ArchSelect';
import BlueprintMode from './components/BlueprintMode';
import CentOSAcknowledgement from './components/CentOSAcknowledgement';
import ImageSourceSelect from './components/ImageSourceSelect';
import ReleaseLifecycle from './components/ReleaseLifecycle';
import ReleaseSelect from './components/ReleaseSelect';
import TargetEnvironment from './components/TargetEnvironment';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { generateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const dispatch = useAppDispatch();
  const isImageMode = useAppSelector(selectIsImageMode);
  const blueprintName = useAppSelector(selectBlueprintName);
  const distribution = useAppSelector(selectDistribution);
  const arch = useAppSelector(selectArchitecture);
  const isCustomName = useAppSelector(selectIsCustomName);

  useEffect(() => {
    const defaultName = generateDefaultName(distribution, arch);
    if (!isCustomName && blueprintName !== defaultName) {
      dispatch(changeBlueprintName(defaultName));
    }
  }, [dispatch, distribution, arch, isCustomName]);

  return (
    <Form>
      <Title headingLevel='h1' size='xl'>
        Image output
      </Title>
      <Content>
        Select the release, architecture, and a target environment to build your
        image. Learn more about <DocumentationButton />
      </Content>
      {!(distribution as string).startsWith('fedora') && <BlueprintMode />}
      {isImageMode && <ImageSourceSelect />}
      {!isImageMode && (
        <>
          <ReleaseSelect />
          {distribution.match('centos-*') && <CentOSAcknowledgement />}
          <ReleaseLifecycle />
        </>
      )}
      <ArchSelect />
      <TargetEnvironment />
    </Form>
  );
};

export default ImageOutputStep;
