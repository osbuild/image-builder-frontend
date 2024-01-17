import React from 'react';

import { Alert, Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';
import { useCheckRepositoriesAvailability } from '../../utilities/checkRepositoriesAvailability';

const RepositoryUnavailable = () => {
  const { isBeta } = useGetEnvironment();

  if (useCheckRepositoriesAvailability()) {
    return (
      <Alert
        variant="warning"
        title="Previously added custom repository unavailable"
        isInline
      >
        A repository that was used to build this image previously is not
        available. Address the error found in the last introspection and
        validate that the repository is still accessible.
        <br />
        <br />
        <Button
          component="a"
          target="_blank"
          variant="link"
          iconPosition="right"
          isInline
          icon={<ExternalLinkAltIcon />}
          href={isBeta() ? '/preview/settings/content' : '/settings/content'}
        >
          Go to Repositories
        </Button>
      </Alert>
    );
  } else {
    return;
  }
};

export default RepositoryUnavailable;
