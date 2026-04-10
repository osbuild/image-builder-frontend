import React from 'react';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const RegisterSatellite = ({ shouldHide }: Hideable) => {
  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Registration method'
      description='Register with satellite'
    />
  );
};
