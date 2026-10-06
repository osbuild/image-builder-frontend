import React from 'react';

import {
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import { selectHostname } from '@/store/slices';

export const Hostname = ({ shouldHide }: Hideable) => {
  const hostname = useAppSelector(selectHostname);

  return (
    <ReviewSection title='Hostname' shouldHide={shouldHide || !hostname}>
      <ReviewGroup heading='Name' description={hostname} />
    </ReviewSection>
  );
};
