import React from 'react';

import { Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import { selectAwsAccountId, selectAwsRegion } from '@/store/slices';

import { DetailsStack } from '../../../shared';

export const AWSDetails = () => {
  const awsAccountId = useAppSelector(selectAwsAccountId);
  const region = useAppSelector(selectAwsRegion);

  return (
    <DetailsStack heading='Amazon Web Services'>
      <Content component='p'>
        Shared with account: {awsAccountId}
        <br />
        Region: {region || 'us-east-1'}
        <br />
      </Content>
    </DetailsStack>
  );
};
