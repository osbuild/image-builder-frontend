import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { RepositoryIcon } from '@patternfly/react-icons';

import { CONTENT_URL } from '../../../../../constants';

type EmptyProps = {
  refetch: () => void;
  hasFilterValue: boolean;
};

const Empty = ({ hasFilterValue, refetch }: EmptyProps) => {
  return (
    <EmptyState
      headingLevel="h4"
      icon={RepositoryIcon}
      titleText={
        hasFilterValue
          ? 'No matching repositories found'
          : 'No custom repositories'
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
          className="pf-v6-u-mr-sm"
        >
          Go to repositories
        </Button>
        <Button variant="secondary" isInline onClick={() => refetch()}>
          Refresh
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default Empty;
