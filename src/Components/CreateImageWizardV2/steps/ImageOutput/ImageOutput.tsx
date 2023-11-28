import React, { useContext } from 'react';

import {
  Text,
  Alert,
  Bullseye,
  Form,
  Spinner,
  Title,
} from '@patternfly/react-core';

import ArchSelect from './ArchSelect';
import CentOSAcknowledgement from './CentOSAcknowledgement';
import Environment, { useGetAllowedTargets } from './Environment';
import ReleaseSelect from './ReleaseSelect';

import DocumentationButton from '../../../sharedComponents/DocumentationButton';
import { ImageWizardContext } from '../../ImageWizardContext';

/**
 * Manages the form for the image output step by providing the user with a
 * choice for:
 * - a distribution
 * - a release
 * - a set of environments
 */
const ImageOutputStep = () => {
  const { releaseState, architectureState } = useContext(ImageWizardContext);
  const [release] = releaseState;
  const [architecture] = architectureState;
  const { isFetching, isError, isSuccess } = useGetAllowedTargets({
    architecture: architecture,
    release: release,
  });
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
      {release.match('centos-*') && <CentOSAcknowledgement />}
      {isFetching && (
        <Bullseye>
          <Spinner size="lg" />
        </Bullseye>
      )}
      {isError && (
        <Alert
          variant={'danger'}
          isPlain
          isInline
          title={'Environments unavailable'}
        >
          API cannot be reached, try again later.
        </Alert>
      )}
      {isSuccess && !isFetching && <Environment />}
    </Form>
  );
};

export default ImageOutputStep;
