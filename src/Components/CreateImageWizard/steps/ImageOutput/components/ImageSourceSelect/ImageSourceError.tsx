import React from 'react';

import { Alert } from '@patternfly/react-core';

type ImageSourceErrorProps = {
  isOnPremise: boolean;
};

const ImageSourceError = ({ isOnPremise }: ImageSourceErrorProps) => (
  <Alert
    title='Error loading bootc images'
    variant='danger'
    className='pf-v6-u-mb-md'
  >
    {isOnPremise
      ? 'Unable to load available bootc images. Ensure podman is installed and accessible.'
      : 'Unable to load available bootc images. Please try again later.'}
  </Alert>
);

export default ImageSourceError;
