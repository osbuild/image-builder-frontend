import {
  awsAccountIdSchema,
  azureResourceGroupSchema,
  azureSubscriptionIdSchema,
  azureTenantIdSchema,
  cloudSliceSchema,
} from './schemas';
import { CloudProviderSlice } from './types';

import { validateSchema } from '../validators';

export const validateAwsAccountId = (accountId: string | undefined) => {
  const { data, issues } = validateSchema(awsAccountIdSchema, accountId);

  return {
    data,
    errors: issues,
  };
};

export const validateAzureTenantId = (tenantId: string | undefined) => {
  const { data, issues } = validateSchema(azureTenantIdSchema, tenantId);

  return {
    data,
    errors: issues,
  };
};

export const validateAzureSubscriptionId = (
  subscriptionId: string | undefined,
) => {
  const { data, issues } = validateSchema(
    azureSubscriptionIdSchema,
    subscriptionId,
  );

  return {
    data,
    errors: issues,
  };
};

export const validateAzureResourceGroup = (group: string | undefined) => {
  const { data, issues } = validateSchema(azureResourceGroupSchema, group);

  return {
    data,
    errors: issues,
  };
};

export const validateCloudSlice = (slice: Omit<CloudProviderSlice, 'gcp'>) => {
  const { data, issues } = validateSchema(cloudSliceSchema, slice);

  return {
    data,
    errors: issues,
  };
};
