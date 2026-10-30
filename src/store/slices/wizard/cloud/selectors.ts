import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@/store';

export const selectAwsAccountId = (state: RootState) => {
  if (state.wizard.cloudProviders.aws.shareMethod === 'manual') {
    return state.wizard.cloudProviders.aws.accountId;
  }
};

export const selectAwsRegion = (state: RootState) => {
  if (state.wizard.cloudProviders.aws.shareMethod === 'onprem') {
    return state.wizard.cloudProviders.aws.region;
  }
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.cloudProviders.azure?.tenantId;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.cloudProviders.azure?.subscriptionId;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.cloudProviders.azure?.resourceGroup;
};

export const selectAzureHyperVGeneration = (state: RootState) => {
  return state.wizard.cloudProviders.azure?.hyperVGeneration;
};

export const selectGcpAccountType = (state: RootState) => {
  return state.wizard.cloudProviders.gcp?.accountType;
};

export const selectGcpEmail = (state: RootState) => {
  if (state.wizard.cloudProviders.gcp?.accountType !== 'domain') {
    return state.wizard.cloudProviders.gcp?.email;
  }
};

export const selectGcpDomain = (state: RootState) => {
  if (state.wizard.cloudProviders.gcp?.accountType === 'domain') {
    return state.wizard.cloudProviders.gcp.domain;
  }
};

export const selectGcpPrincipal = createSelector(
  [selectGcpAccountType, selectGcpEmail, selectGcpDomain],
  (accountType, email, domain) => {
    if (!accountType) return;
    if (accountType === 'domain') return domain;
    return email;
  },
);

export const selectCloudSlice = (state: RootState) => {
  return state.wizard.cloudProviders;
};
