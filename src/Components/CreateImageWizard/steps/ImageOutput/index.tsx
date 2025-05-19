import React, { useEffect } from 'react';

import { Content, Form, Title } from '@patternfly/react-core';

import ArchSelect from './ArchSelect';
import CentOSAcknowledgement from './CentOSAcknowledgement';
import ReleaseLifecycle from './ReleaseLifecycle';
import ReleaseSelect from './ReleaseSelect';
import TargetEnvironment from './TargetEnvironment';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
  changeBlueprintName,
  selectArchitecture,
  selectBlueprintName,
  selectDistribution,
  selectIsCustomName,
} from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { generateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const dispatch = useAppDispatch();
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
      <Title headingLevel="h1" size="xl">
        Image output
      </Title>
      <Content component="p">
        Images enables you to create customized blueprints, create custom images
        from the blueprints, and push them to target environments.
        <br />
        <DocumentationButton />
      </Content>
      <ReleaseSelect />
      {distribution.match('centos-*') && <CentOSAcknowledgement />}
      <ReleaseLifecycle />
      <ArchSelect />
      <TargetEnvironment />
    </Form>
  );
};

export default ImageOutputStep;
