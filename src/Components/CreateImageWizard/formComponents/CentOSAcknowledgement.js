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
          CentOS Stream builds are intended for the development of future
          versions of RHEL and are not supported for production workloads or
          other use cases.
        </>
      }
    >
      <p>
        Join the <DeveloperProgramButton /> to learn about paid and no-cost RHEL
        subscription options.
      </p>
    </Alert>
  );
};

export default CentOSAcknowledgement;
