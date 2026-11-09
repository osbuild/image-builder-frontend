import { DEFAULT_AWS_REGION } from './constants';
import { CloudProviderSlice } from './types';

export const initialState: CloudProviderSlice = {
  aws: {
    accountId: '',
    shareMethod: 'manual',
    source: undefined,
    region: DEFAULT_AWS_REGION,
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
