import { CloudProviderSlice } from './types';

export const initialState: CloudProviderSlice = {
  aws: {
    shareMethod: 'none',
  },
  azure: {
    tenantId: undefined,
    subscriptionId: undefined,
    resourceGroup: undefined,
    hyperVGeneration: 'V2',
  },
  gcp: {
    accountType: 'user',
    email: '',
  },
};
