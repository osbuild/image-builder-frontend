import React from 'react';

import { Popover, Content, Button } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

const OpenSCAPFGLabel = () => {
  return (
    <>
      OpenSCAP profile
      <Popover
        maxWidth="30rem"
        bodyContent={
          <Content>
            <Content component="p">
              To run a manual compliance scan in OpenSCAP, download this image.
            </Content>
          </Content>
        }
      >
        <Button
          icon={<HelpIcon />}
          variant="plain"
          aria-label="About OpenSCAP"
          isInline
          className="pf-v5-u-pl-sm pf-v5-u-pt-0 pf-v5-u-pb-0 pf-v5-u-pr-0"
        />
      </Popover>
    </>
  );
};

export default OpenSCAPFGLabel;
