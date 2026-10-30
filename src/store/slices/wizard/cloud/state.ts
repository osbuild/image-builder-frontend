import { AzureOptions, CloudProviderSlice, GcpOptions } from './types';

export const emptyAzureState: AzureOptions = {
  tenantId: '',
  subscriptionId: '',
  resourceGroup: '',
  hyperVGeneration: 'V2',
};

export const emptyGcpState: GcpOptions = {
  accountType: 'user',
  email: '',
};

export const initialState: CloudProviderSlice = {
  aws: {
    shareMethod: 'none',
  },
  azure: undefined,
  gcp: undefined,
};
