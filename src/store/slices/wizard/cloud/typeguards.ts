import { AzureUploadRequestOptions } from '@/store/api/backend';

import { AwsUploadOptions, UploadOptions } from './types';

export const isAwsUploadOptions = (
  options?: UploadOptions | undefined,
): options is AwsUploadOptions => {
  return (
    !!options &&
    typeof options === 'object' &&
    !('resource_group' in options) &&
    ('share_with_accounts' in options || 'share_with_sources' in options)
  );
};

export const isAzureUploadOptions = (
  options?: UploadOptions | undefined,
): options is AzureUploadRequestOptions => {
  return (
    !!options && typeof options === 'object' && 'resource_group' in options
  );
};

export const isGcpUploadOptions = (
  options?: UploadOptions | undefined,
): options is { share_with_accounts: string[] } => {
  return (
    !!options &&
    typeof options === 'object' &&
    'share_with_accounts' in options &&
    Array.isArray(options.share_with_accounts) &&
    options.share_with_accounts.length > 0
  );
};
