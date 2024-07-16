import React from 'react';

import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  EmptyStateHeader,
  Bullseye,
} from '@patternfly/react-core';

export const Loading = () => {
  return (
    <Bullseye>
      <EmptyState>
        <EmptyStateHeader
          titleText="Loading"
          icon={<EmptyStateIcon icon={Spinner} />}
          headingLevel="h4"
        />
      </EmptyState>
    </Bullseye>
  );
};
