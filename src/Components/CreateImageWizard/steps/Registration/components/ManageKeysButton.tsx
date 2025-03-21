import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { ACTIVATION_KEYS_URL } from '../../../../../constants';

const ManageKeysButton = () => {
  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={ACTIVATION_KEYS_URL}
    >
      Activation keys page
    </Button>
  );
};

export default ManageKeysButton;
