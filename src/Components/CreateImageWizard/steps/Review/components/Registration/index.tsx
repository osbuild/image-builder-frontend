import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectRegistrationType } from '@/store/slices';
import { useFlag } from '@/Utilities/useGetEnvironment';

import { RegisterLater, RegisterNow, RegisterSatellite } from './components';
import { isRegisterNowType } from './types';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

const Registration = ({ restrictions }: ReviewCardProps) => {
  const isWizardRevampEnabled = useFlag('image-builder.wizard-revamp.enabled');
  const registrationType = useAppSelector(selectRegistrationType);

  if (restrictions.registration.shouldHide) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title='Registration'
        stepId={isWizardRevampEnabled ? 'base-settings-step' : 'step-register'}
      />
      <CardBody>
        <ReviewList>
          <RegisterLater shouldHide={registrationType !== 'register-later'} />
          <RegisterSatellite
            shouldHide={registrationType !== 'register-satellite'}
          />
          <RegisterNow
            registrationType={registrationType}
            shouldHide={!isRegisterNowType(registrationType)}
          />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default Registration;
