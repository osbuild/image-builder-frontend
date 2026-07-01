import { ComposerImageRequest, ImageRequest } from '@/store/api/backend';

import { initialState } from './state';
import {
  isAwsUploadOptions,
  isAzureUploadOptions,
  isGcpUploadOptions,
} from './typeguards';
import { AwsShareMethod, CloudProviderSlice, GcpAccountType } from './types';

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
  return {
    accountId: options.share_with_accounts?.[0] || defaults.accountId,
    // NOTE: the share method was deprecated, this field
    // stays here for backwards compatability, but we
    // could probably now consider removing it
    shareMethod: ('share_with_sources' in options
      ? 'sources'
      : 'manual') as AwsShareMethod,
    source: { id: options.share_with_sources?.[0] },
    sourceId: options.share_with_sources?.[0],
    region: 'region' in options ? options.region : undefined,
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
