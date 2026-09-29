import React, { useEffect, useState } from 'react';

import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

import { applyBlueprintSplits } from '@/store/api/backend/onprem/migrations';

type Props = {
  children: React.ReactNode;
};

const SingleTargetMigrationGate = ({ children }: Props) => {
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    applyBlueprintSplits().then(
      () => {
        if (!cancelled) setIsComplete(true);
      },
      (reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <EmptyState
        role='alert'
        isFullHeight
        status='danger'
        titleText='Blueprint migration failed'
      >
        <EmptyStateBody>{error}</EmptyStateBody>
      </EmptyState>
    );
  }

  if (!isComplete) {
    return (
      <EmptyState role='status' aria-label='Updating blueprints' isFullHeight>
        <Spinner size='xl' aria-label='Updating blueprints' />
        <EmptyStateBody>
          Updating existing blueprints to use one image target each.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return <>{children}</>;
};

export default SingleTargetMigrationGate;
