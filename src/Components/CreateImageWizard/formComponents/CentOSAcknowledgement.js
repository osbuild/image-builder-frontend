import React from 'react';
import { Alert, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const DeveloperProgramButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={'https://developers.redhat.com/about'}
    >
      Red Hat Developer Program
    </Button>
  );
};

const CentOSAcknowledgement = () => {
  return (
    <Alert
      variant="info"
      isPlain
      isInline
      title={
        <>
          CentOS Stream builds may only be used for the development of
          RHEL-Next.
        </>
      }
    >
      <p>
        For other applications, use a RHEL distribution.
        <br />
        For those without subscriptions, join the Red Hat Developer program and
        get cost-free RHEL: <DeveloperProgramButton />
      </p>
    </Alert>
  );
};

export default CentOSAcknowledgement;
