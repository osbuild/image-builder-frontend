import { RootState } from '@/store';

export const selectAwsAccountId = (state: RootState): string => {
  return state.wizard.cloudProviders.aws.accountId;
};

export const selectAwsRegion = (state: RootState) => {
  return state.wizard.cloudProviders.aws.region;
};

export const selectAzureTenantId = (state: RootState) => {
  return state.wizard.cloudProviders.azure.tenantId;
};

export const selectAzureSubscriptionId = (state: RootState) => {
  return state.wizard.cloudProviders.azure.subscriptionId;
};

export const selectAzureResourceGroup = (state: RootState) => {
  return state.wizard.cloudProviders.azure.resourceGroup;
};

export const selectAzureHyperVGeneration = (state: RootState) => {
  return state.wizard.cloudProviders.azure.hyperVGeneration;
};

export const selectGcpAccountType = (state: RootState) => {
  return state.wizard.cloudProviders.gcp.accountType;
};

export const selectGcpEmail = (state: RootState) => {
  return state.wizard.cloudProviders.gcp.email;
};
