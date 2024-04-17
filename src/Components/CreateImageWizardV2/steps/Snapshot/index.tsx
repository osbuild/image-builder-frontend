import React from 'react';

import { Button, Form, Grid, Text, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useHref } from 'react-router-dom';

import Snapshot from './Snapshot';

export default function SnapshotStep() {
  const path = useHref('image-builder');
  const pathname = path.split('image-builder')[0] + 'content';
  return (
    <Form>
      <Title headingLevel="h1" size="xl">
        Repository snapshot
      </Title>
      <Grid>
        <Text>
          Control the consistency of the packages in the repository used to
          build the image.
        </Text>
        <Button
          component="a"
          target="_blank"
          variant="link"
          iconPosition="right"
          isInline
          icon={<ExternalLinkAltIcon />}
          href={pathname + '/repositories'}
        >
          Create and manage repositories here
        </Button>
      </Grid>
      <Snapshot />
    </Form>
  );
}
