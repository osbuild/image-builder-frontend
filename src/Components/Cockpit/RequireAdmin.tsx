import React from 'react';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { LockIcon } from '@patternfly/react-icons';

export const RequireAdmin = () => {
  return (
    <EmptyState variant={EmptyStateVariant.xl}>
      <EmptyStateHeader
        titleText="Access is limited."
        headingLevel="h4"
        icon={<EmptyStateIcon icon={LockIcon} color="#f4c145" />}
      />
      <EmptyStateBody>
        Administrative access is required to run the Image Builder frontend.
        Click on the icon in the toolbar to grant administrative access.
      </EmptyStateBody>
    </EmptyState>
  );
};
