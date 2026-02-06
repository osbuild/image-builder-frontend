import { Distributions, ImageTypes } from '../imageBuilderApi';

export type CustomizationType =
  | 'packages'
  | 'repositories'
  | 'filesystem'
  | 'kernel'
  | 'timezone'
  | 'locale'
  | 'firewall'
  | 'services'
  | 'hostname'
  | 'firstBoot'
  | 'openscap'
  | 'registration'
  | 'users'
  | 'fips'
  | 'aap';

export type CustomizationRestrictions = Partial<
  Record<ImageTypes, CustomizationType[]>
>;

export type DistributionDetails = {
  name: string;
  architectures?: Record<string, ArchitectureInfo>;
};

export type ArchitectureInfo = {
  name: string;
  image_types?: Record<string, ImageTypeInfo>;
};

export type ImageTypeInfo = {
  name: string;
  aliases?: string[];
  required_blueprint_options?: string[];
  supported_blueprint_options?: string[];
};

export type DistributionDetailsCustomizationArgs = {
  distro: Distributions | 'image-mode';
  architecture: string[];
  imageType: ImageTypes[];
};

export type DistributionDetailsCustomizationApi = DistributionDetails;

export type RestrictionStrategy = {
  shouldHide: boolean;
  required: boolean;
};
