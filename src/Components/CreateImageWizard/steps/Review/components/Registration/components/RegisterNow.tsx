import React from 'react';

import { Content } from '@patternfly/react-core';

import {
  ReviewGroup,
  StatusItem,
} from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { Hideable } from '@/Components/CreateImageWizard/steps/Review/components/types';
import { useAppSelector } from '@/store/hooks';
import {
  RegistrationType,
  selectActivationKey,
  selectInsights,
  selectOrgId,
  selectRhc,
} from '@/store/slices/wizard';

type RegisterNowProps = Hideable & {
  registrationType: RegistrationType;
};

const Status = (props: { rhcEnabled: boolean; insightsEnabled: boolean }) => {
  if (!props.rhcEnabled && !props.insightsEnabled)
    return (
      <Content component='p'>
        <StatusItem>
          Register with Red Hat Subscription Manager (RHSM)
        </StatusItem>
      </Content>
    );

  const LightspeedContent = (
    <Content component='p'>
      <StatusItem>
        Enable predictive analytics and management capabilities
      </StatusItem>
    </Content>
  );

  if (!props.rhcEnabled) return LightspeedContent;

  return (
    <>
      {LightspeedContent}
      <Content component='p'>
        <StatusItem>
          Enable remote remediations and system management with automation
        </StatusItem>
      </Content>
    </>
  );
};

export const RegisterNow = ({
  shouldHide,
  registrationType,
}: RegisterNowProps) => {
  const activationKey = useAppSelector(selectActivationKey);
  const orgId = useAppSelector(selectOrgId);
  const rhcEnabled = useAppSelector(selectRhc);
  const insightsEnabled = useAppSelector(selectInsights);

  if (shouldHide || registrationType !== 'register-now') {
    return null;
  }

  return (
    <>
      <ReviewGroup
        heading='Registration method'
        description={
          <Status rhcEnabled={rhcEnabled} insightsEnabled={insightsEnabled} />
        }
      />
      <ReviewGroup heading='Organization ID' description={orgId} />
      <ReviewGroup heading='Activation key' description={activationKey} />
    </>
  );
};
