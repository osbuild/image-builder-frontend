import {
  ALL_CUSTOMIZATIONS,
  type CustomizationType,
  type DistributionDetails,
  type ImageTypeInfo,
  type SupportContext,
} from '@/store/api/distributions';

export const createMockDistributionDetails = (
  imageTypes: Record<string, Partial<ImageTypeInfo>>,
  name = 'rhel-9',
  architecture = 'x86_64',
): DistributionDetails => ({
  name,
  architectures: {
    [architecture]: {
      name: architecture,
      image_types: Object.fromEntries(
        Object.entries(imageTypes).map(([key, value]) => [
          key,
          {
            name: key,
            ...value,
          },
        ]),
      ) as Record<string, ImageTypeInfo>,
    },
  },
});

export const createMockImageType = (
  name: string,
  supportedOptions?: string[],
): ImageTypeInfo => {
  const result: ImageTypeInfo = { name };
  if (supportedOptions !== undefined) {
    result.supported_blueprint_options = supportedOptions;
  }
  return result;
};

export const allCustomizations: CustomizationType[] = [...ALL_CUSTOMIZATIONS];

export const mockImageTypes = {
  awsWithAllCustomizations: createMockImageType('aws', [...ALL_CUSTOMIZATIONS]),
  awsWithLimitedCustomizations: createMockImageType('aws', [
    'packages',
    'filesystem',
    'users',
  ]),
  imageInstallerWithoutFilesystem: createMockImageType('image-installer', [
    'packages',
    'repositories',
    'kernel',
    'timezone',
    'locale',
    'firewall',
    'services',
    'hostname',
    'firstBoot',
    'openscap',
    'users',
    'fips',
    'aap',
  ]),
  networkInstallerMinimal: createMockImageType('network-installer', [
    'locale',
    'fips',
  ]),
  wslWithoutFilesystemKernelOpenscap: createMockImageType('wsl', [
    'packages',
    'repositories',
    'timezone',
    'locale',
    'firewall',
    'services',
    'hostname',
    'firstBoot',
    'registration',
    'users',
    'fips',
    'aap',
  ]),
  gcpUndefined: createMockImageType('gcp'), // undefined means supports all
};

export const defaultContext: SupportContext = {
  isImageMode: false,
  isOnPremise: false,
  isRhel: true,
};
