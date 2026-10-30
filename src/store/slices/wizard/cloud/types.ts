import z from 'zod';

import { AwsUploadRequestOptions, UploadRequest } from '@/store/api/backend';

import { azureSchema, cloudSliceSchema, gcpSchema } from './schemas';

export type UploadOptions = UploadRequest['options'];
export type AwsUploadOptions = AwsUploadRequestOptions & {
  region?: string | undefined;
};

export type AzureOptions = z.infer<typeof azureSchema>;
export type AzureHyperVGeneration = AzureOptions['hyperVGeneration'];

export type GcpOptions = z.infer<typeof gcpSchema>;
export type GcpAccountType = GcpOptions['accountType'];

export type CloudProviderSlice = z.infer<typeof cloudSliceSchema>;
