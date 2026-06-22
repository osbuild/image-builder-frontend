import {
  BootcDistributionItem,
  Distributions,
  ImageRequest,
  ImageTypes,
} from '@/store/api/backend';

export type ImageSource = string;

export type OutputSlice = {
  imageSource?: ImageSource | undefined;
  isoPayloadReference?: string | undefined;
  bootcDistributions: BootcDistributionItem[];
  architecture: ImageRequest['architecture'];
  distribution: Distributions;
  imageTypes: ImageTypes[];
};
