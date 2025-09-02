import React from 'react';

import { Button, Content, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const MinimumSizePopover = () => {
  return (
    <Popover
      maxWidth='30rem'
      bodyContent={
        <Content>
          <Content>
            Image Builder may extend this size based on requirements, selected
            packages, and configurations.
          </Content>
        </Content>
      }
    >
      <Button
        icon={<HelpIcon />}
        variant='plain'
        aria-label='File system configuration info'
        aria-describedby='file-system-configuration-info'
        className='popover-button pf-v6-u-p-0'
      />
    </Popover>
  );
};

export default MinimumSizePopover;
