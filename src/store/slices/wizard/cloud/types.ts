import z from 'zod';

import { AwsUploadRequestOptions, UploadRequest } from '@/store/api/backend';

import { azureSchema, cloudSliceSchema } from './schemas';

export type GcpAccountType = 'user' | 'serviceAccount' | 'group' | 'domain';

export type UploadOptions = UploadRequest['options'];

export type AwsUploadOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

export type AzureOptions = z.infer<typeof azureSchema>;
export type AzureHyperVGeneration = AzureOptions['hyperVGeneration'];

export type GcpOptions =
  | {
      accountType: 'user' | 'serviceAccount' | 'group';
      email?: string | undefined;
    }
  | {
      accountType: 'domain';
      domain?: string | undefined;
    };

export type CloudProviderSlice = z.infer<typeof cloudSliceSchema> & {
  gcp?: GcpOptions | undefined;
};
