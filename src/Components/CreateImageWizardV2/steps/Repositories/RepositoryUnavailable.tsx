import React from 'react';

import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';

import { useGetEnvironment } from '../../../../Utilities/useGetEnvironment';

const RepositoryUnavailable = ({ quantity }: { quantity: number }) => {
  const { isBeta } = useGetEnvironment();

  return (
    <Alert
      variant="warning"
      title="Previously added custom repository unavailable"
      isInline
    >
      {quantity > 1
        ? `${quantity} repositories that were used to build this image previously are not available.`
        : 'One repository that was used to build this image previously is not available. '}
      Address the error found in the last introspection and validate that the
      repository is still accessible.
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
};

export default RepositoryUnavailable;
