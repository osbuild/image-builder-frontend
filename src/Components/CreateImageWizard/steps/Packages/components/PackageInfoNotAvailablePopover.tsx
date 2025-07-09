import React from 'react';

import { Button, Content, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const PackageInfoNotAvailablePopover = () => {
  return (
    <Popover
      headerContent="Package description"
      bodyContent={
        <Content>
          <Content>
            The package description provides more information about the package.
          </Content>
          <Content>
            When editing an existing blueprint, you may see a &quot;Not
            available&quot; value in the field because information about
            previously added packages can not be fetched.
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant="plain"
        aria-label="Package description"
        className="pf-v6-u-pl-sm pf-v6-u-pt-0 pf-v6-u-pb-0"
      />
    </Popover>
  );
};

export default PackageInfoNotAvailablePopover;
