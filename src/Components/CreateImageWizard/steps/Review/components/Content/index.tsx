import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useFlag } from '@/Utilities/useGetEnvironment';

import {
  PackageDetails,
  PackageGroupDetails,
  RepositoryDetails,
} from './components';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

type ContentOverviewProps = ReviewCardProps & {
  oscapPackages?: string[];
};

const ContentOverview = ({
  restrictions,
  oscapPackages = [],
}: ContentOverviewProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');

  if (
    restrictions.packages.shouldHide &&
    restrictions.repositories.shouldHide
  ) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title='Repositories and packages'
        stepId={
          isWizardRevampEnabled ? 'content-step' : 'wizard-repository-snapshot'
        }
      />
      <CardBody>
        <ReviewList>
          <RepositoryDetails
            shouldHide={restrictions.repositories.shouldHide}
          />
          <PackageDetails
            shouldHide={restrictions.packages.shouldHide}
            oscapPackages={oscapPackages}
          />
          <PackageGroupDetails shouldHide={restrictions.packages.shouldHide} />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default ContentOverview;
