import React from 'react';

import {
  LabelMapper,
  ReviewGroup,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import { selectPackageGroups } from '@/store/slices';

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
