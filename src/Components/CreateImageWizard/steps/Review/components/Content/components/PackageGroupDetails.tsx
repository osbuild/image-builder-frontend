import React from 'react';

import { useAppSelector } from '@/store/hooks';
import { selectPackageGroups } from '@/store/slices';

import { LabelMapper, ReviewGroup } from '../../shared';
import { Hideable } from '../../types';

export const PackageGroupDetails = ({ shouldHide }: Hideable) => {
  const groups = useAppSelector(selectPackageGroups);

  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Package groups'
      description={
        <LabelMapper
          id='package-group-review'
          ariaLabel='Package groups'
          emptyMessage='No groups selected'
          items={groups.map((group) => group.name)}
        />
      }
    />
  );
};
