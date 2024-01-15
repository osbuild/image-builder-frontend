import React from 'react';

import { Button, Form, Text, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

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
      <Title headingLevel="h2">Custom repositories</Title>
      <Text>
        Select from linked custom repositories from which to search and add
        packages to this image.
        <br />
        <ManageRepositoriesButton />
      </Text>
    </Form>
  );
};

export default RepositoriesStep;
