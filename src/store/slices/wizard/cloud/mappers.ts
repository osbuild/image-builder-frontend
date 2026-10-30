import { createSelector } from '@reduxjs/toolkit';

import {
  selectAwsAccountId,
  selectAwsRegion,
  selectAzureHyperVGeneration,
  selectAzureResourceGroup,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectGcpAccountType,
  selectGcpEmail,
} from './selectors';

export const mapAwsImageOptions = createSelector(
  [selectAwsAccountId, selectAwsRegion],
  (accountId, region) => {
    if (accountId) {
      return {
        share_with_accounts: [accountId],
      };
    }

    if (region) {
      return {
        region,
      };
    }

    return {};
  },
);

export const mapAzureImageOptions = createSelector(
  [
    selectAzureTenantId,
    selectAzureSubscriptionId,
    selectAzureResourceGroup,
    selectAzureHyperVGeneration,
  ],
  (tenantId, subscriptionId, resourceGroup, hyperVGen) => {
    // Guard: skip cloud options when required credentials are missing.
    if (!tenantId || !subscriptionId) {
      return {};
    }

    return {
      tenant_id: tenantId,
      subscription_id: subscriptionId,
      resource_group: resourceGroup || '',
      hyper_v_generation: hyperVGen,
    };
  },
);

export const mapGcpImageOptions = createSelector(
  [selectGcpEmail, selectGcpAccountType],
  (gcpEmail, accountType) => {
    // Guard: skip cloud options when required credentials are missing.
    if (!gcpEmail || !accountType) {
      return {};
    }

    return { share_with_accounts: [`${accountType}:${gcpEmail}`] };
  },
);

export const mapAwsUploadRequest = createSelector(
  [mapAwsImageOptions],
  (options) => ({ upload_request: { type: 'aws' as const, options } }),
);

export const mapAzureUploadRequest = createSelector(
  [mapAzureImageOptions],
  (options) => ({ upload_request: { type: 'azure' as const, options } }),
);

export const mapGcpUploadRequest = createSelector(
  [mapGcpImageOptions],
  (options) => ({ upload_request: { type: 'gcp' as const, options } }),
);
