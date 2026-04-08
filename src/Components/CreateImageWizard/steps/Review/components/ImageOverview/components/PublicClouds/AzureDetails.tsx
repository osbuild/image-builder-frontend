import React from 'react';

import { Content } from '@patternfly/react-core';

import { useAppSelector } from '@/store/hooks';
import {
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
} from '@/store/slices';

import { DetailsStack } from '../../../shared';

export const AzureDetails = () => {
  const tenantId = useAppSelector(selectAzureTenantId);
  const subscriptionId = useAppSelector(selectAzureSubscriptionId);
  const resourceGroup = useAppSelector(selectAzureResourceGroup);

  return (
    <DetailsStack heading='Microsoft Azure'>
      <Content component='p'>
        Tenant ID: {tenantId}
        <br />
        Subscription ID: {subscriptionId}
        <br />
        Resource group: {resourceGroup}
        <br />
      </Content>
    </DetailsStack>
  );
};
