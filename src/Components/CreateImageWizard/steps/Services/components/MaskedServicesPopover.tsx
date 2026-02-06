import React from 'react';

import {
  Content,
  ContentVariants,
  FormGroupLabelHelp,
  Popover,
} from '@patternfly/react-core';

const MaskedServicesPopover = () => {
  return (
    <Popover
      headerContent={'What are masked services?'}
      bodyContent={
        <Content component={ContentVariants.p}>
          Masked services are completely disabled and cannot be started, even
          manually. They don&apos;t require the package to be installed. This is
          stronger than simply disabling a service.
        </Content>
      }
    >
      <FormGroupLabelHelp aria-label='Masked services information' />
    </Popover>
  );
};

export default MaskedServicesPopover;
