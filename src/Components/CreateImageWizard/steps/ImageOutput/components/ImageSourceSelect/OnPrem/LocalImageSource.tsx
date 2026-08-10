import React from 'react';

import {
  ClipboardCopy,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';

const LocalImageSource = () => {
  return (
    <EmptyState
      variant='sm'
      icon={RocketIcon}
      titleText='Local image support is coming soon'
      headingLevel='h4'
      className='pf-v6-u-mt-md'
    >
      <EmptyStateBody>
        Until support arrives in Cockpit Image Builder 10.4, build local
        container images with the image-builder command-line tool:
        <ClipboardCopy
          isReadOnly
          isCode
          hoverTip='Copy'
          clickTip='Copied'
          className='pf-v6-u-mt-md'
        >
          {
            'image-builder build qcow2 --bootc-ref localhost/my-derived-image:latest'
          }
        </ClipboardCopy>
      </EmptyStateBody>
    </EmptyState>
  );
};

export default LocalImageSource;
