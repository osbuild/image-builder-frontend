import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import ArchSelect from './ArchSelect';
import CentOSAcknowledgement from './CentOSAcknowledgement';
import ReleaseLifecycle from './ReleaseLifecycle';
import ReleaseSelect from './ReleaseSelect';
import TargetEnvironment from './TargetEnvironment';

import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { useGenerateDefaultName } from '../../utilities/useGenerateDefaultName';

const ImageOutputStep = () => {
  const distribution = useAppSelector(selectDistribution);

  useGenerateDefaultName();

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Image output
      </Title>
      <Text>
        Images enables you to create customized blueprints, create custom images
        from the blueprints, and push them to target environments
        <br />
        <DocumentationButton />
      </Text>
      <ReleaseSelect />
      {distribution.match('centos-*') && <CentOSAcknowledgement />}
      <ReleaseLifecycle />
      <ArchSelect />
      <TargetEnvironment />
    </Form>
  );
};

export default ImageOutputStep;
