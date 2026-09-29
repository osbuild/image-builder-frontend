import React, { useEffect, useState } from 'react';

import { EmptyState, EmptyStateBody, Spinner } from '@patternfly/react-core';

import {
  applyBlueprintSplits,
  type BlueprintMigrationError,
} from '@/store/api/backend/onprem/migrations';

type Props = {
  children: React.ReactNode;
};

const SingleTargetMigrationGate = ({ children }: Props) => {
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<BlueprintMigrationError>();

  useEffect(() => {
    let cancelled = false;
    applyBlueprintSplits().then(
      () => {
        if (!cancelled) setIsComplete(true);
      },
      (reason: unknown) => {
        if (!cancelled) setError(reason as BlueprintMigrationError);
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
        <EmptyStateBody>
          {error.stage === 'planning' && (
            <p>
              Migration writes have not started. Correct the issue below, then
              reload Cockpit to try again.
            </p>
          )}
          {error.stage === 'backup' && (
            <>
              <p>
                Migration writes have not started. A complete backup may not
                exist, so do not use it for recovery.
              </p>
              {error.backupPath && (
                <p>
                  Attempted backup location: <code>{error.backupPath}</code>
                </p>
              )}
            </>
          )}
          {error.stage === 'migration' && (
            <>
              <p>
                Migration may be partial. Stop using Image Builder and restore
                from this backup before continuing:
              </p>
              {error.backupPath && (
                <p>
                  <code>{error.backupPath}</code>
                </p>
              )}
              <p>
                <a
                  href='single-target-migration-recovery.md'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Read the local recovery instructions
                </a>
              </p>
            </>
          )}
          <p>{error.message}</p>
        </EmptyStateBody>
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
