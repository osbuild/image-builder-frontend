import React from 'react';

import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateIcon,
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

const Empty = ({ hasFilterValue, refetch }: EmptyProps) => {
  return (
    <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
      <EmptyStateHeader
        titleText={
          hasFilterValue
            ? 'No matching repositories found'
            : 'No custom repositories'
        }
        icon={<EmptyStateIcon icon={RepositoryIcon} />}
        headingLevel="h4"
      />
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
};

export default Empty;
