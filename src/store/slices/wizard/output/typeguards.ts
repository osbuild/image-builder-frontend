import { targetOptions } from '@/constants';
import { ImageTypes } from '@/store/api/backend/hosted';

import {
  EDGE_TYPES,
  PRIVATE_CLOUD_TYPES,
  PUBLIC_CLOUD_TYPES,
  RHEL_DISTRIBUTIONS,
} from './constants';
import type {
  EdgeType,
  PrivateCloudType,
  PublicCloudType,
  RhelDistribution,
  SupportedImageTypes,
} from './types';

export const isImageType = (key: string): key is ImageTypes => {
  return key in targetOptions;
};

export const isRhel = (
  distro: string | undefined,
): distro is RhelDistribution => {
  return !!distro && (RHEL_DISTRIBUTIONS as readonly string[]).includes(distro);
};

export const isPublicCloud = (env: string): env is PublicCloudType => {
  return (PUBLIC_CLOUD_TYPES as readonly string[]).includes(env);
};

export const isPrivateCloud = (env: string): env is PrivateCloudType => {
  return (PRIVATE_CLOUD_TYPES as readonly string[]).includes(env);
};

export const isEdgeType = (env: string): env is EdgeType => {
  return (EDGE_TYPES as readonly string[]).includes(env);
};

export const isSupportedImageType = (
  env: string,
): env is SupportedImageTypes => {
  return isImageType(env) && !isEdgeType(env);
};
