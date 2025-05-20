import React from 'react';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export const RequireAdmin = () => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={LockIcon}
      titleText="Access is limited."
      variant={EmptyStateVariant.xl}
    >
      <EmptyStateBody>
        Administrative access is required to run the Image Builder frontend.
        Click on the icon in the toolbar to grant administrative access.
      </EmptyStateBody>
    </EmptyState>
  );
};
