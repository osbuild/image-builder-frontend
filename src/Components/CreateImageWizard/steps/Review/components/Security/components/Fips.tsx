import React from 'react';

import {
  ReviewGroup,
  StatusItem,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';

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
