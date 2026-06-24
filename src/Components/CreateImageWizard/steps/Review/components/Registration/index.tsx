import React from 'react';

import { Card, CardBody } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  isRegisterNowType,
  selectAapEnabled,
  selectRegistrationType,
} from '@/store/slices/wizard';

import {
  RegisterAAP,
  RegisterLater,
  RegisterNow,
  RegisterSatellite,
} from './components';

import { ReviewCardHeader, ReviewList } from '../shared';
import { ReviewCardProps } from '../types';

const Registration = ({ restrictions }: ReviewCardProps) => {
  const registrationType = useAppSelector(selectRegistrationType);
  const aapEnabled = useAppSelector(selectAapEnabled);

  if (restrictions.registration.shouldHide && restrictions.aap.shouldHide) {
    return null;
  }

  return (
    <Card>
      <ReviewCardHeader
        title='Registration'
        stepId='base-settings-step'
        sectionId='registration-section'
      />
      <CardBody>
        <ReviewList>
          <RegisterLater
            shouldHide={
              restrictions.registration.shouldHide ||
              registrationType !== 'register-later'
            }
          />
          <RegisterSatellite
            shouldHide={
              restrictions.registration.shouldHide ||
              registrationType !== 'register-satellite'
            }
          />
          <RegisterNow
            registrationType={registrationType}
            shouldHide={
              restrictions.registration.shouldHide ||
              !isRegisterNowType(registrationType)
            }
          />
          <RegisterAAP
            shouldHide={restrictions.aap.shouldHide || !aapEnabled}
          />
        </ReviewList>
      </CardBody>
    </Card>
  );
};

export default Registration;
