import React from 'react';

import { Content } from '@patternfly/react-core';

import { DetailsStack } from '@/Components/CreateImageWizard/steps/Review/components/shared';
import { useAppSelector } from '@/store/hooks';
import {
  DEFAULT_AWS_REGION,
  selectAwsAccountId,
  selectAwsRegion,
} from '@/store/slices';
import { selectIsOnPremise } from '@/store/slices/env';

export const AWSDetails = () => {
  const accountId = useAppSelector(selectAwsAccountId);
  const region = useAppSelector(selectAwsRegion);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  if (isOnPremise && !region) return null;
  if (!isOnPremise && !accountId) return null;

  return (
    <DetailsStack heading='Amazon Web Services'>
      {accountId && (
        <Content component='p'>
          Shared with account: {accountId}
          <br />
          Region: {DEFAULT_AWS_REGION}
          <br />
        </Content>
      )}
      {region && (
        <Content component='p'>
          Region: {region}
          <br />
        </Content>
      )}
    </DetailsStack>
  );
};
