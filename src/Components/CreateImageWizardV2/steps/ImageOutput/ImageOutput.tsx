import React, { Dispatch, SetStateAction } from 'react';

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
import Environment, { EnvironmentStateType } from './Environment';
import ReleaseSelect from './ReleaseSelect';

import {
  ArchitectureItem,
  Distributions,
} from '../../../../store/imageBuilderApi';
import DocumentationButton from '../../../sharedComponents/DocumentationButton';

type ImageOutputPropTypes = {
  release: Distributions;
  setRelease: Dispatch<SetStateAction<Distributions>>;
  arch: ArchitectureItem['arch'];
  setArch: Dispatch<SetStateAction<ArchitectureItem['arch']>>;
  environment: EnvironmentStateType;
  setEnvironment: Dispatch<SetStateAction<EnvironmentStateType>>;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
};

/**
 * Manages the form for the image output step by providing the user with a
 * choice for:
 * - a distribution
 * - a release
 * - a set of environments
 */
const ImageOutputStep = ({
  release,
  setRelease,
  arch,
  setArch,
  setEnvironment,
  environment,
  isFetching,
  isError,
  isSuccess,
}: ImageOutputPropTypes) => {
  return (
    <Form>
      <Title headingLevel="h2">Image output</Title>
      <Text>
        Image builder allows you to create a custom image and push it to target
        environments.
        <br />
        <DocumentationButton />
      </Text>
      <ReleaseSelect setRelease={setRelease} release={release} />
      <ArchSelect setArch={setArch} arch={arch} />
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
      {isSuccess && !isFetching && (
        <Environment
          setEnvironment={setEnvironment}
          environment={environment}
        />
      )}
    </Form>
  );
};

export default ImageOutputStep;
