import React from 'react';

import { Alert } from '@patternfly/react-core';

export const Error = () => {
  return (
    <Alert title='Repositories unavailable' variant='danger' isPlain isInline>
      Repositories cannot be reached, try again later.
    </Alert>
  );
};
