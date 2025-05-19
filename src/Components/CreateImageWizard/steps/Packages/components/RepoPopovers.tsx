import React from 'react';

import { Button, Popover, Content } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

export const IncludedReposPopover = () => {
  return (
    <Popover
      bodyContent={
        <Content>
          <Content component="p">
            View packages from the Red Hat repository and repositories
            you&apos;ve selected.
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="About included repositories"
        component="span"
        className="pf-v5-u-p-0"
        size="sm"
        isInline
      />
    </Popover>
  );
};

export const OtherReposPopover = () => {
  return (
    <Popover
      bodyContent={
        <Content>
          <Content component="p">
            View packages from popular repositories and your other repositories
            not included in the image.
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="About other repositories"
        component="span"
        className="pf-v5-u-p-0"
        size="sm"
        isInline
      />
    </Popover>
  );
};
