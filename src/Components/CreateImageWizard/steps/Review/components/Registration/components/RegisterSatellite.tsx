import React from 'react';

import { ReviewGroup } from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';

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
