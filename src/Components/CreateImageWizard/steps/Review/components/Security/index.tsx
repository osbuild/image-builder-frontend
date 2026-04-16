import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectFips, selectIsOnPremise } from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { FIPSDetails, SecurityDetails } from './components';
import { isSecurityConfigured, SecuritySummary } from './types';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

type SecurityCardProps = ReviewCardProps & {
  security?: SecuritySummary | undefined;
};

const Security = ({ restrictions, security }: SecurityCardProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const isOnPremise = useAppSelector(selectIsOnPremise);
  const { enabled: fipsEnabled } = useAppSelector(selectFips);

  if (restrictions.openscap.shouldHide && restrictions.fips.shouldHide) {
    return null;
  }

  if (!isSecurityConfigured(security) && !fipsEnabled) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title={
          isOnPremise ? 'Security configuration' : 'Compliance configuration'
        }
        stepId={
          isWizardRevampEnabled
            ? 'base-settings-step'
            : 'wizard-repository-snapshot'
        }
        {...(isWizardRevampEnabled && { sectionId: 'security-section' })}
      />
      <CardBody>
        <ReviewList>
          <FIPSDetails
            shouldHide={restrictions.fips.shouldHide || !fipsEnabled}
          />
          <SecurityDetails
            shouldHide={restrictions.openscap.shouldHide}
            security={security}
          />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default Security;
