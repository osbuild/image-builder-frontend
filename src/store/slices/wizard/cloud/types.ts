import z from 'zod';

import { AwsUploadRequestOptions, UploadRequest } from '@/store/api/backend';

import { awsSchema } from './schemas';

export type AzureHyperVGeneration = 'V1' | 'V2';

export type GcpAccountType = 'user' | 'serviceAccount' | 'group' | 'domain';

export type UploadOptions = UploadRequest['options'];

export type AwsUploadOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

export type CloudProviderSlice = {
  aws: z.infer<typeof awsSchema>;
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
