import React from 'react';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const RegisterLater = ({ shouldHide }: Hideable) => {
  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Registration method'
      description='Register the system later'
    />
  );
};
