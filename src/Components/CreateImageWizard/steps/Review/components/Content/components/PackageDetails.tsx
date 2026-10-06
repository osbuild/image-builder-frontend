import React, { useMemo } from 'react';

import { sortOpenscapItems } from '@/Components/CreateImageWizard/steps/Review/components/helpers';
import {
  LabelMapper,
  ReviewGroup,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import { selectPackages } from '@/store/slices';

type PackageDetailProps = Hideable & {
  oscapPackages?: string[];
};

export const PackageDetails = ({
  shouldHide,
  oscapPackages = [],
}: PackageDetailProps) => {
  const packages = useAppSelector(selectPackages);

  const pkgs = useMemo(
    () =>
      sortOpenscapItems(
        oscapPackages,
        packages.map((pkg) => pkg.name),
      ),
    [packages, oscapPackages],
  );

  if (shouldHide) {
    return null;
  }

  return (
    <ReviewGroup
      heading='Packages'
      description={
        <LabelMapper
          id='package-review'
          ariaLabel='Packages'
          emptyMessage='No packages selected'
          items={pkgs}
          oscapItems={oscapPackages}
        />
      }
    />
  );
};
