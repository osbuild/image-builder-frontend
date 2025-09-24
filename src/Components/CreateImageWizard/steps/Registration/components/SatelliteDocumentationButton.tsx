import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { REGISTRATION_DOCS_URL } from '../../../../../constants';

const SatelliteDocumentationButton = () => {
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      icon={<ExternalLinkAltIcon />}
      iconPosition='right'
      isInline
      href={REGISTRATION_DOCS_URL}
    >
      documentation
    </Button>
  );
};

export default SatelliteDocumentationButton;
