import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';

import GoToTemplatesButton from './GoToTemplatesButton';

type TemplatesEmptyProps = {
  refetch: () => void;
};

const TemplatesEmpty = ({ refetch }: TemplatesEmptyProps) => {
  return (
    <EmptyState
      headingLevel='h4'
      titleText={'No content templates'}
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        {`Content templates can be added in the "Templates" area of the
        console.`}
      </EmptyStateBody>
      <EmptyStateFooter>
        <GoToTemplatesButton />
        <Button variant='secondary' isInline onClick={() => refetch()}>
          Refresh
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default TemplatesEmpty;
