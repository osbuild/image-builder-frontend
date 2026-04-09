import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectFips, selectIsOnPremise } from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { FIPSDetails, SecurityDetails } from './components';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

const Security = ({ restrictions }: ReviewCardProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const { enabled: fipsEnabled } = useAppSelector(selectFips);

  if (restrictions.openscap.shouldHide && restrictions.fips.shouldHide) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title={
          isOnPremise ? 'Security configuration' : 'Compliance configuration'
        }
        stepId={
          isWizardRevampEnabled ? 'content-step' : 'wizard-repository-snapshot'
        }
      />
      <CardBody>
        <ReviewList>
          <FIPSDetails
            shouldHide={restrictions.fips.shouldHide || !fipsEnabled}
          />
          <SecurityDetails shouldHide={restrictions.openscap.shouldHide} />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default Security;
