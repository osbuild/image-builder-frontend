import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import {
  ACTIVATION_KEYS_PROD_URL,
  ACTIVATION_KEYS_STAGE_URL,
} from '../../../../../constants';
import { useGetEnvironment } from '../../../../../Utilities/useGetEnvironment';

const ManageKeysButton = () => {
  const { isProd } = useGetEnvironment();

  return (
    <Button
      component="a"
      target="_blank"
      variant="link"
      icon={<ExternalLinkAltIcon />}
      iconPosition="right"
      isInline
      href={isProd() ? ACTIVATION_KEYS_PROD_URL : ACTIVATION_KEYS_STAGE_URL}
    >
      Activation keys page
    </Button>
  );
};

export default ManageKeysButton;
