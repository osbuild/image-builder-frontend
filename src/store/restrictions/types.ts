import { ImageTypes } from '../imageBuilderApi';

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
  | 'users'
  | 'fips'
  | 'aap';

export const ALL_CUSTOMIZATION_TYPES = [
  'packages',
  'repositories',
  'filesystem',
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
] as const satisfies readonly CustomizationType[];

export const customizationLabels: Record<CustomizationType, string> = {
  packages: 'Packages',
  repositories: 'Repositories',
  filesystem: 'File system',
  kernel: 'Kernel',
  timezone: 'Timezone',
  locale: 'Locale',
  firewall: 'Firewall',
  services: 'Services',
  hostname: 'Hostname',
  firstBoot: 'First boot script',
  openscap: 'OpenSCAP',
  users: 'Users',
  fips: 'FIPS',
  aap: 'Ansible Automation Platform',
};

export type CustomizationRestrictions = Partial<
  Record<ImageTypes, CustomizationType[]>
>;

// The list of supported customizations for each image type can be
// found in the distrodefs files in the osbuild/images repo:
// https://github.com/osbuild/images/blob/7b147da42d3e56a3045b7eb7c9e2e445acd8dad5/data/distrodefs/rhel-10/imagetypes.yaml
export const RESTRICTED_IMAGE_TYPES: CustomizationRestrictions = {
  'network-installer': ['locale', 'fips'],
  'image-installer': [
    // image-installer has everything but filesystem
    ...ALL_CUSTOMIZATION_TYPES.filter((c) => c !== 'filesystem'),
  ],
  wsl: [
    // wsl has everything but filesystem & kernel
    ...ALL_CUSTOMIZATION_TYPES.filter(
      (c) => c !== 'filesystem' && c !== 'kernel',
    ),
  ],
} as const satisfies CustomizationRestrictions;

export type RestrictedCustomizationArgs = {
  selectedImageTypes: ImageTypes[];
};

export type RestrictedCustomizationApi = {
  isAllowed: Record<CustomizationType, boolean>;
};

export type RestrictedImageType = keyof typeof RESTRICTED_IMAGE_TYPES;

export type RestrictionStrategy = {
  isAllowed: boolean;
  shouldHide: boolean;
  supportedImageTypes: ImageTypes[];
};
