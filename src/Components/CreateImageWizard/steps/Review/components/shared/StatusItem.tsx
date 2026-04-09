import React, { PropsWithChildren } from 'react';

import { Icon } from '@patternfly/react-core';
import { CheckCircleIcon, CloseIcon } from '@patternfly/react-icons';

export const StatusItem = ({
  variant = 'success',
  children,
}: PropsWithChildren<{ variant?: 'success' | 'danger' }>) => {
  return (
    <>
      <Icon status={variant}>
        {variant === 'success' && <CheckCircleIcon />}
        {variant === 'danger' && <CloseIcon />}
      </Icon>{' '}
      {children}
    </>
  );
};
