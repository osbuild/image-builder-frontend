import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

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
        stepId='content-step'
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
