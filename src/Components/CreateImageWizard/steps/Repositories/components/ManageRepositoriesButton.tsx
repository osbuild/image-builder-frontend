import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../../constants';

const ManageRepositoriesButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      iconPosition="right"
      isInline
      icon={<ExternalLinkAltIcon />}
      href={CONTENT_URL}
    >
      Create and manage repositories here
    </Button>
  );
};

export default ManageRepositoriesButton;
