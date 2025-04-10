import React from 'react';

import { EmptyState, Spinner, Bullseye } from '@patternfly/react-core';

export const Loading = () => {
  return (
    <Bullseye>
      <EmptyState
        headingLevel="h4"
        icon={Spinner}
        titleText="Loading"
      ></EmptyState>
    </Bullseye>
  );
};
