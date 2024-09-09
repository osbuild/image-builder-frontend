import React from 'react';

import {
  Title,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

const BlueprintsEmpty = () => (
  <EmptyState>
    <EmptyStateIcon icon={CubesIcon} />
    <Title headingLevel="h4" size="lg">
      {'No blueprints'}
    </Title>
    <EmptyStateBody />
  </EmptyState>
);

export default BlueprintsEmpty;
