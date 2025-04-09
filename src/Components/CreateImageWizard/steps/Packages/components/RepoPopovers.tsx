import React from 'react';

import { Button, Popover, Text, TextContent } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export const IncludedReposPopover = () => {
  return (
    <Popover
      bodyContent={
        <TextContent>
          <Text>
            View packages from the Red Hat repository and repositories
            you&apos;ve selected.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="About included repositories"
        component="span"
        className="pf-v5-u-p-0"
        size="sm"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export const OtherReposPopover = () => {
  return (
    <Popover
      bodyContent={
        <TextContent>
          <Text>
            View packages from popular repositories and your other repositories
            not included in the image.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="About other repositories"
        component="span"
        className="pf-v5-u-p-0"
        size="sm"
        isInline
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};
