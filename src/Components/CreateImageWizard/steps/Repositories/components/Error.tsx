import React from 'react';

import { Alert } from '@patternfly/react-core';

const Error = () => {
  return (
    <Alert title='Repositories unavailable' variant='danger' isInline>
      Repositories cannot be reached, try again later.
    </Alert>
  );
};

export default Error;
