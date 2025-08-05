import React from 'react';

import { Alert } from '@patternfly/react-core';

const UsrSubDirectoriesDisabled = () => {
  return (
    <Alert
      variant='warning'
      title='Sub-directories for the /usr mount point are no longer supported'
      isInline
    >
      Please note that including sub-directories in the /usr path is no longer
      supported. Previously included mount points with /usr sub-directory are
      replaced by /usr when recreating an image.
    </Alert>
  );
};

export default UsrSubDirectoriesDisabled;
