import React from 'react';

import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Form } from '@patternfly/react-core/dist/dynamic/components/Form';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Title } from '@patternfly/react-core/dist/dynamic/components/Title';
import { Grid } from '@patternfly/react-core/dist/dynamic/layouts/Grid';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
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
      <Alert
        variant="info"
        isInline
        title="The snapshot date only applies to RHEL content."
      >
        Third party, custom repositories will always use the newest repository
        state available.
      </Alert>
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
