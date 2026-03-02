import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { TEMPLATES_URL } from '@/constants';

const GoToTemplatesButton = () => {
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      icon={<ExternalLinkAltIcon />}
      href={TEMPLATES_URL}
    >
      Go to content templates
    </Button>
  );
};

export default GoToTemplatesButton;
