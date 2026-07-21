import {
  BootcDistributionItem,
  Distributions,
  ImageRequest,
  ImageTypes,
} from '@/store/api/backend';

import {
  EDGE_TYPES,
  PRIVATE_CLOUD_TYPES,
  PUBLIC_CLOUD_TYPES,
  RHEL_DISTRIBUTIONS,
} from './constants';

export type PublicCloudType = (typeof PUBLIC_CLOUD_TYPES)[number];
export type PrivateCloudType = (typeof PRIVATE_CLOUD_TYPES)[number];
export type EdgeType = (typeof EDGE_TYPES)[number];

export type SupportedImageTypes = Exclude<ImageTypes, EdgeType>;

export type MiscFormatType = Exclude<
  SupportedImageTypes,
  PublicCloudType | PrivateCloudType
>;

export type ImageSource = string;
export type ImageSourceType = 'official' | 'custom';

export type RhelDistribution = (typeof RHEL_DISTRIBUTIONS)[number];

export type OutputSlice = {
  imageSource?: ImageSource | undefined;
  imageSourceType: ImageSourceType;
  isoPayloadReference?: string | undefined;
  bootcDistributions: BootcDistributionItem[];
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: SupportedImageTypes[];
};
