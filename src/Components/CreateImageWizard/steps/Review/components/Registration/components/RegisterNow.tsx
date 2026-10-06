import React from 'react';

import { Content } from '@patternfly/react-core';

import {
  ReviewGroup,
  StatusItem,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import {
  isRegisterNowType,
  RegistrationType,
  selectActivationKey,
  selectOrgId,
} from '@/store/slices/wizard';

import { REGISTER_NOW_FEATURES } from '../constants';

type RegisterNowProps = Hideable & {
  registrationType: RegistrationType;
};

export const RegisterNow = ({
  shouldHide,
  registrationType,
}: RegisterNowProps) => {
  const activationKey = useAppSelector(selectActivationKey);
  const orgId = useAppSelector(selectOrgId);

  if (shouldHide || !isRegisterNowType(registrationType)) {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Registration method'
        description={
          // NOTE: a lookup is maybe slightly harder to read,
          // but it reduces the complexity of all the if/else
          // branching for the matrix of register now options
          REGISTER_NOW_FEATURES[registrationType].map(
            (registrationItem, index) => (
              <Content key={`${registrationType}-${index}`} component='p'>
                <StatusItem>{registrationItem}</StatusItem>
              </Content>
            ),
          )
        }
      />
      <ReviewGroup heading='Organization ID' description={orgId} />
      <ReviewGroup heading='Activation key' description={activationKey} />
    </>
  );
};
