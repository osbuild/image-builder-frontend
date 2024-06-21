import React from 'react';

import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { Popover } from '@patternfly/react-core/dist/dynamic/components/Popover';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import HelpIcon from '@patternfly/react-icons/dist/dynamic/icons/help-icon';

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
        className="pf-u-pl-sm pf-u-pt-0 pf-u-pb-0"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};

export default PackageInfoNotAvailablePopover;
