import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME, CONTENT_URL } from '../../../../../constants';
import { useGetUser } from '../../../../../Hooks';

const ManageRepositoriesButton = () => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  return (
    <Button
      id='create-and-manage-repositories-button'
      component='a'
      target='_blank'
      variant='link'
      iconPosition='right'
      isInline
      icon={<ExternalLinkAltIcon />}
      onClick={() => {
        if (!process.env.IS_ON_PREMISE) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Outside link clicked`, {
            button_id: 'create-and-manage-repositories-button',
            account_id: userData?.identity.internal?.account_id || 'Not found',
          });
        }
      }}
      href={CONTENT_URL}
    >
      Create and manage repositories here
    </Button>
  );
};

export default ManageRepositoriesButton;
