import { AwsUploadRequestOptions, UploadRequest } from '@/store/api/backend';

export type AwsShareMethod = 'manual';

export type AzureHyperVGeneration = 'V1' | 'V2';

export type GcpAccountType = 'user' | 'serviceAccount' | 'group' | 'domain';

// The Sources API only defines a V1ListSourceResponseItem[] type
export type V1ListSourceResponseItem = {
  id?: string | undefined;
  name?: string;
  source_type_id?: string;
  uid?: string;
};

export type UploadOptions = UploadRequest['options'];

export type AwsUploadOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

export type CloudProviderSlice = {
  aws: {
    accountId: string;
    shareMethod: AwsShareMethod;
    source: V1ListSourceResponseItem | undefined;
    sourceId?: string | undefined;
    region?: string | undefined;
  };
  azure: {
    tenantId: string | undefined;
    subscriptionId: string | undefined;
    resourceGroup: string | undefined;
    hyperVGeneration: AzureHyperVGeneration;
  };
  gcp: {
    accountType: GcpAccountType | undefined;
    email: string;
  };
};
