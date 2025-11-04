import React from 'react';

import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { AMPLITUDE_MODULE_NAME, IB_DOCUMENTATION_URL } from '../../constants';
import { useGetUser } from '../../Hooks';

const DocumentationButton = () => {
  const documentationURL = IB_DOCUMENTATION_URL;
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
            account_id: userData?.identity.internal?.account_id || 'Not found',
            step_id: 'step-image-output',
          });
        }
      }}
      href={documentationURL}
    >
      Documentation
    </Button>
  );
};

export default DocumentationButton;
