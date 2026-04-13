import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectFirstBootScript } from '@/store/slices';

import { ReviewGroup, StatusItem } from '../../shared';
import { Hideable } from '../../types';

export const Firstboot = ({ shouldHide }: Hideable) => {
  const script = useAppSelector(selectFirstBootScript);

  if (shouldHide || !script) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='First boot configuration'
        description={<StatusItem>Configured</StatusItem>}
      />
    </>
  );
};
