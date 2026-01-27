import React, { useEffect } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import ArchSelect from './components/ArchSelect';
import BlueprintMode from './components/BlueprintMode';
import CentOSAcknowledgement from './components/CentOSAcknowledgement';
import ImageSourceSelect from './components/ImageSourceSelect';
import ReleaseLifecycle from './components/ReleaseLifecycle';
import ReleaseSelect from './components/ReleaseSelect';
import TargetEnvironment from './components/TargetEnvironment';

import { useIsOnPremise } from '../../../../Hooks';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
  selectIsCustomName,
  selectIsImageMode,
} from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { generateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const isOnPremise = useIsOnPremise();
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
        Image builder enables you to create customized blueprints, create custom
        images from the blueprints, and push them to target environments.
        <br />
        <DocumentationButton />
      </Content>
      {isOnPremise &&
        // The distribution won't be defined if the blueprint is in image mode
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !distribution?.startsWith('fedora') && <BlueprintMode />}
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
