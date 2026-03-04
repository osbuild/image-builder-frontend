import { Architectures } from '@/store/imageBuilderApi';

export const mockArchitecturesX86: Architectures = [
  {
    arch: 'x86_64',
    image_types: [
      'aws',
      'azure',
      'gcp',
      'guest-image',
      'image-installer',
      'vsphere',
      'vsphere-ova',
      'wsl',
      'oci',
      'ami',
      'vhd',
    ],
    repositories: [
      {
        baseurl:
          'https://cdn.redhat.com/content/dist/rhel/server/10/x86_64/baseos/os',
        rhsm: true,
      },
    ],
  },
];

export const mockArchitecturesAarch64: Architectures = [
  {
    arch: 'aarch64',
    image_types: ['aws', 'guest-image', 'image-installer', 'wsl', 'ami'],
    repositories: [
      {
        baseurl:
          'https://cdn.redhat.com/content/dist/rhel/server/10/aarch64/baseos/os',
        rhsm: true,
      },
    ],
  },
];

export const mockArchitecturesBoth: Architectures = [
  ...mockArchitecturesX86,
  ...mockArchitecturesAarch64,
];
