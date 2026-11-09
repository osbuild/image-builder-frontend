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
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const region = useAppSelector(selectAwsRegion);
  const isOnPremise = useAppSelector(selectIsOnPremise);

  return (
    <DetailsStack heading='Amazon Web Services'>
      {!isOnPremise && (
        <Content component='p'>
          Shared with account: {awsAccountId}
          <br />
          Region: {region || DEFAULT_AWS_REGION}
          <br />
        </Content>
      )}
    </DetailsStack>
  );
};
