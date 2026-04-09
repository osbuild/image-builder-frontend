import React from 'react';

import { ReviewGroup, StatusItem } from '../../shared';
import { Hideable } from '../../types';

export const FIPSDetails = ({ shouldHide }: Hideable) => {
  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='FIPS mode'
      description={<StatusItem>Enabled</StatusItem>}
    />
  );
};
