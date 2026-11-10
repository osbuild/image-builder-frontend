import { AzureOptions, CloudProviderSlice } from './types';

export const emptyAzureState: AzureOptions = {
  tenantId: '',
  subscriptionId: '',
  resourceGroup: '',
  hyperVGeneration: 'V2',
};

export const initialState: CloudProviderSlice = {
  aws: {
    shareMethod: 'none',
  },
  azure: undefined,
  gcp: {
    accountType: 'user',
    email: '',
  },
};
