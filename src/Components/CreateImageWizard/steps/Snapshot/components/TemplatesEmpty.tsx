import React from 'react';

import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateBody,
  EmptyStateFooter,
  Button,
} from '@patternfly/react-core';

import { TEMPLATES_URL } from '../../../../../constants';

export default function TemplatesEmpty() {
  return (
    <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
      <EmptyStateHeader titleText={'No Content Templates'} headingLevel="h4" />
      <EmptyStateBody>
        {`Content templates can be added in the "Templates" area of the
        console.`}
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="primary"
          component="a"
          target="_blank"
          href={TEMPLATES_URL}
          className="pf-v5-u-mr-sm"
        >
          Go to content templates
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
}
