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

const ImageOutputStep = () => {
  const distribution = useAppSelector((state) => selectDistribution(state));

  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Image output
      </Title>
      <Text>
        Image builder allows you to create a custom image and push it to target
        environments.
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
