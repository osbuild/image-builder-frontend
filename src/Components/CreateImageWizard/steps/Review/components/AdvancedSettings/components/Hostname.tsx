import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectHostname } from '@/store/slices';

import { ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const Hostname = ({ shouldHide }: Hideable) => {
  const hostname = useAppSelector(selectHostname);

  if (shouldHide || !hostname) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Hostname'
      description={hostname}
      className='pf-v6-u-mb-md'
    />
  );
};
