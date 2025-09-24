import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import {
  ACTIVATION_KEYS_URL,
  AMPLITUDE_MODULE_NAME,
} from '../../../../../constants';
import { useGetUser } from '../../../../../Hooks';

const ManageKeysButton = () => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      icon={<ExternalLinkAltIcon />}
      iconPosition='right'
      isInline
      onClick={() => {
        if (!process.env.IS_ON_PREMISE) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Outside link clicked`, {
            step_id: 'step-registration',
            account_id: userData?.identity.internal?.account_id || 'Not found',
          });
        }
      }}
      href={ACTIVATION_KEYS_URL}
    >
      Manage activation keys
    </Button>
  );
};

export default ManageKeysButton;
