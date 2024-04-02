import React from 'react';

import { Button, Form, Text, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import Repositories from './Repositories';

import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const ManageRepositoriesButton = () => {
  const { isBeta } = useGetEnvironment();
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      iconPosition="right"
      isInline
      icon={<ExternalLinkAltIcon />}
      href={isBeta() ? '/preview/settings/content' : '/settings/content'}
    >
      Create and manage repositories here
    </Button>
  );
};

const RepositoriesStep = () => {
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Custom repositories
      </Title>
      <Text>
        Select the linked custom repositories from which you can add packages to
        the image.
        <br />
        <ManageRepositoriesButton />
      </Text>
      <Repositories />
    </Form>
  );
};

export default RepositoriesStep;
