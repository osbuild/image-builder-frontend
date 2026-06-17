import React from 'react';

import { Alert } from '@patternfly/react-core';

const CentOSStream8Alert = () => {
  return (
    <Alert
      style={{
        margin:
          '0 var(--pf-v6-c-toolbar__content--PaddingRight) 0 var(--pf-v6-c-toolbar__content--PaddingLeft)',
      }}
      isInline
      variant='warning'
      title='CentOS Stream 8 is no longer supported, building images from this blueprint will fail. Edit blueprint to update the release to CentOS Stream 9.'
    />
  );
};

export default CentOSStream8Alert;
