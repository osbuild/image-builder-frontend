import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectHostname } from '@/store/slices';

import { ReviewGroup, ReviewSection } from '../../shared';
import { Hideable } from '../../types';

export const Hostname = ({ shouldHide }: Hideable) => {
  const hostname = useAppSelector(selectHostname);

  if (shouldHide || !hostname) {
    return null;
  }

  return (
    <ReviewSection title='Hostname'>
      <ReviewGroup heading='Name' description={hostname} />
    </ReviewSection>
  );
};
