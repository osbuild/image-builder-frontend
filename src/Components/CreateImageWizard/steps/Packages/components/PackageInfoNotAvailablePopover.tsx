import React from 'react';

import { Button, Popover, TextContent, Text } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const PackageInfoNotAvailablePopover = () => {
  return (
    <Popover
      headerContent="Package description"
      bodyContent={
        <TextContent>
          <Text>
            The package description provides more information about the package.
          </Text>
          <Text>
            When editing an existing blueprint, you may see a &quot;Not
            available&quot; value in the field because information about
            previously added packages can not be fetched.
          </Text>
        </TextContent>
      }
    >
      <Button
        variant="plain"
        aria-label="Package description"
        className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export default PackageInfoNotAvailablePopover;
