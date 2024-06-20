import React from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';

import { DOCUMENTATION_URL } from '../../constants';

const DocumentationButton = () => {
  const documentationURL = DOCUMENTATION_URL;

  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={documentationURL}
    >
      Documentation
    </Button>
  );
};

export default DocumentationButton;
