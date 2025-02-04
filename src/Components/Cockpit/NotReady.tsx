import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import cockpit from 'cockpit';

export const NotReady = ({ enabled }: { enabled: boolean }) => {
  return (
    <EmptyState variant={EmptyStateVariant.xl}>
      <EmptyStateIcon icon={CubesIcon} />
      <Title headingLevel="h4" size="lg">
        OSBuild Composer is not {enabled ? 'started' : 'enabled'}
      </Title>
      <EmptyStateBody />
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="primary"
            onClick={(event) => {
              event.preventDefault();
              cockpit
                .spawn(
                  ['systemctl', 'enable', '--now', 'osbuild-composer.socket'],
                  {
                    superuser: 'require',
                    err: 'message',
                  }
                )
                .then(() => window.location.reload());
            }}
          >
            Start socket
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
