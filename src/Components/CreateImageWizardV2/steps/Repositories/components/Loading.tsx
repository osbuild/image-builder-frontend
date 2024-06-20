import React from 'react';

import { EmptyState } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateIcon } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateHeader } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';

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
