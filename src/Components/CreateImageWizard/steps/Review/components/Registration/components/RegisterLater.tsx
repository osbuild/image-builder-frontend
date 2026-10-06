import React from 'react';

import { ReviewGroup } from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';

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
