import { CloudProviderSlice } from './types';

export const initialState: CloudProviderSlice = {
  aws: {
    accountId: '',
    shareMethod: 'manual',
    source: undefined,
    region: 'us-east-1',
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
