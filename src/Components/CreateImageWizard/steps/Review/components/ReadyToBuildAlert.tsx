import React from 'react';

import { Alert, Content } from '@patternfly/react-core';

const ReadyToBuildAlert = () => {
  return (
    <Alert variant='info' title='Ready to build' ouiaId='ReadyToBuild'>
      <Content component='p'>
        Your image configuration is complete and ready to build. The build
        process may take several minutes depending on the size and complexity of
        your image.
      </Content>
    </Alert>
  );
};

export default ReadyToBuildAlert;
