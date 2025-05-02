import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import cockpit from 'cockpit';

export const NotReady = ({ enabled }: { enabled: boolean }) => {
  return (
    <EmptyState variant={EmptyStateVariant.xl}>
      <EmptyStateHeader
        titleText={`OSBuild Composer is not ${enabled ? 'started' : 'enabled'}`}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={CubesIcon} />}
      />
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
        <EmptyStateActions>
          <Button
            variant="link"
            onClick={(event) => {
              event.preventDefault();
              cockpit.jump(
                '/system/services#/osbuild-composer.socket',
                cockpit.transport.host
              );
            }}
          >
            More Info
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
