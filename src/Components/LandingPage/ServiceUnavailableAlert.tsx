import React from 'react';

import { Alert } from '@patternfly/react-core';

const ServiceUnavailableAlert = () => {
  return (
    <Alert
      title='The Image Builder service is currently unavailable. Please check back later.'
      variant='danger'
    />
  );
};

export default ServiceUnavailableAlert;
