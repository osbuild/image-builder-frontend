import React from 'react';

import {
  ReviewGroup,
  ReviewSection,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { useAppSelector } from '@/store/hooks';
import { selectHostname } from '@/store/slices';

export const Hostname = () => {
  const hostname = useAppSelector(selectHostname);

  return (
    <ReviewSection title='Hostname'>
      <ReviewGroup heading='Name' description={hostname} />
    </ReviewSection>
  );
};
