import React from 'react';

import {
  Button,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const RegisterLaterInformation = () => {
  return (
    <TextContent>
      <Text component={TextVariants.h3}>Register Later</Text>
      <Text>
        On initial boot, systems will need to be registered manually before
        having access to updates or Red Hat services. Registering and connecting
        your systems during the image creation is recommended.
      </Text>
      <Text>
        If you prefer to register later, review the instructions for manual
        registration with remote host configuration.
      </Text>
      <Button
        component="a"
        target="_blank"
        variant="link"
        icon={<ExternalLinkAltIcon />}
        iconPosition="right"
        isInline
        href="https://access.redhat.com/articles/rhc"
      >
        Registering with remote host configuration
      </Button>
    </TextContent>
  );
};

export default RegisterLaterInformation;
