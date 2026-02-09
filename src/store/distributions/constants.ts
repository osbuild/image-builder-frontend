import { CustomizationType, ImageTypeInfo } from './types';

export const ALL_CUSTOMIZATIONS = [
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

// We are just mocking the response until we can actually
// get this information from the API.
export const DISTRO_DETAILS: Record<string, ImageTypeInfo> = {
  aws: {
    name: 'aws',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  azure: {
    name: 'azure',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  vhd: {
    name: 'vhd',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  gcp: { name: 'gcp', supported_blueprint_options: [...ALL_CUSTOMIZATIONS] },
  'guest-image': {
    name: 'guest-image',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  'image-installer': {
    name: 'image-installer',
    supported_blueprint_options: [
      // image-installer has everything but filesystem
      ...ALL_CUSTOMIZATIONS.filter((c) => c !== 'filesystem'),
    ],
  },
  vsphere: {
    name: 'vsphere',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  'vsphere-ova': {
    name: 'vsphere-ova',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  wsl: {
    name: 'wsl',
    supported_blueprint_options: [
      // wsl has everything but filesystem & kernel
      ...ALL_CUSTOMIZATIONS.filter((c) => c !== 'filesystem' && c !== 'kernel'),
    ],
  },
  ami: { name: 'ami', supported_blueprint_options: [...ALL_CUSTOMIZATIONS] },
  oci: {
    name: 'oci',
    supported_blueprint_options: [...ALL_CUSTOMIZATIONS],
  },
  'network-installer': {
    name: 'network-installer',
    supported_blueprint_options: ['locale', 'fips'],
  },
  'pxe-tar-xz': {
    name: 'pxe-tar-xz',
    supported_blueprint_options: [
      // pxe boot has everything but filesystem
      ...ALL_CUSTOMIZATIONS.filter((c) => c !== 'filesystem'),
    ],
  },
};
