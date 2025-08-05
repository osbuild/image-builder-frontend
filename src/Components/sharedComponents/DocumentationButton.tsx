import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { DOCUMENTATION_URL } from '../../constants';

const DocumentationButton = () => {
  const documentationURL = DOCUMENTATION_URL;

  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      icon={<ExternalLinkAltIcon />}
      iconPosition='right'
      isInline
      href={documentationURL}
    >
      Documentation
    </Button>
  );
};

export default DocumentationButton;
