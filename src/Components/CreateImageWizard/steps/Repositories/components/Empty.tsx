import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { CONTENT_URL } from '@/constants';

const Empty = () => {
  return (
    <EmptyState
      headingLevel='h4'
      icon={PlusCircleIcon}
      titleText='No custom repositories'
      variant={EmptyStateVariant.lg}
    >
      <EmptyStateBody>
        You can add custom repositories to your environment on the Content
        Repositories page.
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          variant='primary'
          component='a'
          target='_blank'
          href={CONTENT_URL}
          className='pf-v6-u-mr-sm'
        >
          Add custom repositories
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default Empty;
