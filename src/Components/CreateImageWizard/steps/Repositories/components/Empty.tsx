import React from 'react';

import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateBody,
  EmptyStateFooter,
  Button,
} from '@patternfly/react-core';
import { RepositoryIcon } from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../../constants';

type EmptyProps = {
  refetch: () => void;
  hasFilterValue: boolean;
};

export default function Empty({ hasFilterValue, refetch }: EmptyProps) {
  return (
    <EmptyState
      headingLevel="h4"
      icon={RepositoryIcon}
      titleText={
        hasFilterValue
          ? 'No matching repositories found'
          : 'No Custom Repositories'
      }
      variant={EmptyStateVariant.lg}
      data-testid="empty-state"
    >
      <EmptyStateBody>
        {hasFilterValue
          ? 'Try another search query or clear the current search value'
          : `Repositories can be added in the "Repositories" area of the
        console. Once added, refresh this page to see them.`}
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant="primary"
          component="a"
          target="_blank"
          href={CONTENT_URL}
          className="pf-v5-u-mr-sm"
        >
          Go to repositories
        </Button>
        <Button variant="secondary" isInline onClick={() => refetch()}>
          Refresh
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
}
