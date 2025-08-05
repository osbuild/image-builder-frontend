import React from 'react';

import { Bullseye, EmptyState, Spinner } from '@patternfly/react-core';

export const Loading = () => {
  return (
    <Bullseye>
      <EmptyState
        headingLevel='h4'
        icon={Spinner}
        titleText='Loading'
      ></EmptyState>
    </Bullseye>
  );
};
