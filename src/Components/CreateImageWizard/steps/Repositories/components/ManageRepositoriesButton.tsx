import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME, CONTENT_URL } from '@/constants';
import { useGetUser } from '@/Hooks';
import { useAppSelector } from '@/store/hooks';
import { selectIsOnPremise } from '@/store/slices/env';

type ManageRepositoriesButtonProps = {
  label?: string;
  icon?: boolean;
};

const ManageRepositoriesButton = ({
  label,
  icon = false,
}: ManageRepositoriesButtonProps) => {
  const { analytics, auth } = useChrome();
  const { userData } = useGetUser(auth);
  const isOnPremise = useAppSelector(selectIsOnPremise);
  return (
    <Button
      component='a'
      target='_blank'
      variant='link'
      {...(icon && {
        icon: <ExternalLinkAltIcon />,
        iconPosition: 'end',
      })}
      isInline
      onClick={() => {
        if (!isOnPremise) {
          analytics.track(`${AMPLITUDE_MODULE_NAME} - Outside link clicked`, {
            step_id: 'step-repositories',
            account_id: userData?.identity.internal?.account_id || 'Not found',
          });
        }
      }}
      href={CONTENT_URL}
    >
      {label ? label : 'Create and manage repositories'}
    </Button>
  );
};

export default ManageRepositoriesButton;
