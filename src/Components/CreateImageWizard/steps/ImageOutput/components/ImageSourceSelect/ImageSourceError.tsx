import React from 'react';

import { Alert } from '@patternfly/react-core';

const ImageSourceError = () => (
  <Alert
    title='Error loading bootc images'
    variant='danger'
    className='pf-v6-u-mb-md'
  >
    Unable to load available bootc images. Please try again later.
  </Alert>
);

export default ImageSourceError;
