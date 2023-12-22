import React from 'react';

import { Text, Form, Title } from '@patternfly/react-core';

import ArchSelect from './ArchSelect';
import CentOSAcknowledgement from './CentOSAcknowledgement';
import Environment from './Environment';
import ReleaseSelect from './ReleaseSelect';

import { useAppSelector } from '../../../../store/hooks';
import { selectDistribution } from '../../../../store/wizardSlice';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';

/**
 * Manages the form for the image output step by providing the user with a
 * choice for:
 * - a distribution
 * - a release
 * - a set of environments
 */
const ImageOutputStep = () => {
  const distribution = useAppSelector((state) => selectDistribution(state));

  return (
    <Form>
      <Title headingLevel="h2">Image output</Title>
      <Text>
        Image builder allows you to create a custom image and push it to target
        environments.
        <br />
        <DocumentationButton />
      </Text>
      <ReleaseSelect />
      <ArchSelect />
      {distribution.match('centos-*') && <CentOSAcknowledgement />}
      <Environment />
    </Form>
  );
};

export default ImageOutputStep;
