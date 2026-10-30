import { ComposerImageRequest, ImageRequest } from '@/store/api/backend';

import { initialState } from './state';
import {
  isAwsUploadOptions,
  isAzureUploadOptions,
  isGcpUploadOptions,
} from './typeguards';
import { CloudProviderSlice, GcpAccountType } from './types';

import { RequestLike } from '../types';

const parseAws = (
  imageRequests?: ImageRequest[] | ComposerImageRequest[] | undefined,
): CloudProviderSlice['aws'] => {
  const defaults = initialState.aws;
  const aws = imageRequests?.find((image) => image.image_type === 'aws');
  if (!aws || !isAwsUploadOptions(aws.upload_request.options)) {
    return defaults;
  }

  const options = aws.upload_request.options;
  if ('region' in options) {
    return {
      shareMethod: 'onprem',
      region: options.region ?? 'us-east-1',
    };
  }

  if ('share_with_sources' in options) {
    return {
      shareMethod: 'sources',
      source: { id: options.share_with_sources?.[0] },
      sourceId: options.share_with_sources?.[0] ?? '',
    };
  }

  return {
    shareMethod: 'manual',
    accountId: options.share_with_accounts?.[0] || '',
  };
};

const parseAzure = (
  imageRequests?: ImageRequest[] | ComposerImageRequest[] | undefined,
): CloudProviderSlice['azure'] => {
  const defaults = initialState.azure;
  const azure = imageRequests?.find((image) => image.image_type === 'azure');
  if (!azure || !isAzureUploadOptions(azure.upload_request.options)) {
    return defaults;
  }

  const options = azure.upload_request.options;
  return {
    tenantId: options.tenant_id || defaults.tenantId,
    subscriptionId: options.subscription_id || defaults.subscriptionId,
    resourceGroup: options.resource_group || defaults.resourceGroup,
    hyperVGeneration: options.hyper_v_generation || 'V1',
  };
};

const parseGcp = (
  imageRequests?: ImageRequest[] | ComposerImageRequest[] | undefined,
): CloudProviderSlice['gcp'] => {
  // NOTE: the defaults that the request mapper for gcp was using
  // are different to the `initialState`, so we can't use that here
  const defaults = { email: '', accountType: undefined };
  const gcp = imageRequests?.find((image) => image.image_type === 'gcp');
  if (!gcp || !isGcpUploadOptions(gcp.upload_request.options)) {
    return defaults;
  }

  const options = gcp.upload_request.options;
  const [accountType, email] = options.share_with_accounts[0].split(':');
  return {
    accountType: accountType as GcpAccountType,
    email: email || initialState.gcp.email,
  };
};

export const parseCloudProvidersFromRequest = ({
  image_requests: imageRequests,
}: RequestLike): CloudProviderSlice => ({
  aws: parseAws(imageRequests),
  azure: parseAzure(imageRequests),
  gcp: parseGcp(imageRequests),
});
