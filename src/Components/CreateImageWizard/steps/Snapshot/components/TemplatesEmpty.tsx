import React from 'react';

import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateBody,
  EmptyStateFooter,
  Button,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { TEMPLATES_URL } from '../../../../../constants';

type TemplatesEmptyProps = {
  refetch: () => void;
};

const TemplatesEmpty = ({ refetch }: TemplatesEmptyProps) => {
  const GoToTemplatesButton = () => {
    return (
      <Button
        component="a"
        target="_blank"
        variant="link"
        icon={<ExternalLinkAltIcon />}
        href={TEMPLATES_URL}
      >
        Go to content templates
      </Button>
    );
  };

  return (
    <EmptyState variant={EmptyStateVariant.lg} data-testid="empty-state">
      <EmptyStateHeader titleText={'No content templates'} headingLevel="h4" />
      <EmptyStateBody>
        {`Content templates can be added in the "Templates" area of the
        console.`}
      </EmptyStateBody>
      <EmptyStateFooter>
        <GoToTemplatesButton />
        <Button variant="secondary" isInline onClick={() => refetch()}>
          Refresh
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default TemplatesEmpty;
