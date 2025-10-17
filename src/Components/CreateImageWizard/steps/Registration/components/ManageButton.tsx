import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME } from '../../../../../constants';
import { useGetUser } from '../../../../../Hooks';

type ManageButtonProps = {
  url: string;
  children?: React.ReactNode;
  analyticsStepId?: string;
};

const ManageButton = ({
  url,
  children,
  analyticsStepId,
}: ManageButtonProps) => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  return (
    <Button
      component='a'
      target='_blank'
      rel='noreferrer'
      variant='link'
      icon={<ExternalLinkAltIcon />}
      iconPosition='right'
      isInline
      onClick={() => {
        if (!process.env.IS_ON_PREMISE) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Outside link clicked`, {
            step_id: analyticsStepId,
            account_id: userData?.identity.internal?.account_id || 'Not found',
          });
        }
      }}
      href={url}
    >
      {children}
    </Button>
  );
};

export default ManageButton;
