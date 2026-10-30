import z from 'zod';

import {
  awsAccountIdSchema,
  azureResourceGroupSchema,
  azureSubscriptionIdSchema,
  azureTenantIdSchema,
  cloudSliceSchema,
  gcpDomainAccountSchema,
  gcpEmailAccountSchema,
  gcpSchema,
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

export const validateGcpDomainAccount = (
  account: z.infer<typeof gcpDomainAccountSchema>,
) => {
  const { data, issues } = validateSchema(gcpDomainAccountSchema, account);

  return {
    data: data?.domain,
    errors: issues,
  };
};

export const validateGcpEmailAccount = (
  account: z.infer<typeof gcpEmailAccountSchema>,
) => {
  const { data, issues } = validateSchema(gcpEmailAccountSchema, account);

  return {
    data: data?.email,
    errors: issues,
  };
};

export const validateGcpAccount = (
  account?: z.infer<typeof gcpSchema> | undefined,
) => {
  if (account === undefined) {
    return {
      data: undefined,
      errors: [],
    };
  }

  if (account.accountType === 'domain') {
    return validateGcpDomainAccount(account);
  }

  return validateGcpEmailAccount(account);
};

export const validateCloudSlice = (slice: CloudProviderSlice) => {
  const { data, issues } = validateSchema(cloudSliceSchema, slice);

  return {
    data,
    errors: issues,
  };
};
