import React from 'react';

import {
  ClipboardCopy,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';

const CONTENT_MAX_WIDTH = '44rem';

const COMMANDS = [
  'sudo podman login registry.redhat.io',
  'sudo image-builder build qcow2 --bootc-ref registry.redhat.io/rhel10/rhel-bootc',
];

const LocalImageSource = () => {
  return (
    <EmptyState
      variant='sm'
      icon={RocketIcon}
      titleText='Local images are coming soon'
      headingLevel='h4'
      className='pf-v6-u-mt-md'
      style={
        {
          '--pf-v6-c-empty-state__content--MaxWidth': CONTENT_MAX_WIDTH,
        } as React.CSSProperties
      }
    >
      <EmptyStateBody>
        Building from a container image in local storage is on the way. Until
        then, the image-builder command-line tool can do it:
        {COMMANDS.map((command) => (
          <ClipboardCopy
            key={command}
            isReadOnly
            isCode
            hoverTip='Copy'
            clickTip='Copied'
            className='pf-v6-u-mt-md'
          >
            {command}
          </ClipboardCopy>
        ))}
      </EmptyStateBody>
    </EmptyState>
  );
};

export default LocalImageSource;
