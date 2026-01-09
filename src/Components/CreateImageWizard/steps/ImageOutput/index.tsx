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
  selectBlueprintMode,
  selectBlueprintName,
  selectDistribution,
  selectIsCustomName,
} from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { generateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const isOnPremise = useIsOnPremise();
  const dispatch = useAppDispatch();
  const blueprintMode = useAppSelector(selectBlueprintMode);
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
        Images enables you to create customized blueprints, create custom images
        from the blueprints, and push them to target environments.
        <br />
        <DocumentationButton />
      </Content>
      {isOnPremise && !distribution.startsWith('fedora') && <BlueprintMode />}
      {blueprintMode === 'image' && <ImageSourceSelect />}
      {blueprintMode === 'package' && (
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
