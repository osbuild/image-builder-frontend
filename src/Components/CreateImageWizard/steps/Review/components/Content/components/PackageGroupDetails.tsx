import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectGroups } from '@/store/slices';

import { LabelMapper, ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const PackageGroupDetails = ({ shouldHide }: Hideable) => {
  const groups = useAppSelector(selectGroups);

  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Package groups'
      description={
        <LabelMapper
          id='package-group-review'
          emptyMessage='No groups selected'
          items={groups.map((group) => group.name)}
        />
      }
    />
  );
};
