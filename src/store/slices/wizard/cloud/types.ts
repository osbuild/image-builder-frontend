import z from 'zod';

import { AwsUploadRequestOptions, UploadRequest } from '@/store/api/backend';

import { awsSchema, azureSchema } from './schemas';

export type GcpAccountType = 'user' | 'serviceAccount' | 'group' | 'domain';

export type UploadOptions = UploadRequest['options'];

export type AwsUploadOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

type AzureOptions = z.infer<typeof azureSchema>;
export type AzureHyperVGeneration = AzureOptions['hyperVGeneration'];

export type CloudProviderSlice = {
  aws: z.infer<typeof awsSchema>;
  azure: AzureOptions;
  gcp: {
    accountType: GcpAccountType | undefined;
    email: string;
  };
};
