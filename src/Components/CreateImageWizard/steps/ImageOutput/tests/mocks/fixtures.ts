import { Architectures } from '@/store/api/backend';
import { PodmanImageInfo } from '@/store/cockpit/types';

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

export const mockArchitecturesWithNetworkInstaller: Architectures = [
  {
    arch: 'x86_64',
    image_types: [
      'aws',
      'gcp',
      'azure',
      'guest-image',
      'image-installer',
      'network-installer',
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

export const mockPodmanImages: PodmanImageInfo[] = [
  {
    image: 'registry.redhat.io/rhel10/rhel-bootc:10.0',
    repository: 'registry.redhat.io/rhel10/rhel-bootc',
    tag: '10.0',
  },
  {
    image: 'registry.redhat.io/rhel10/rhel-bootc:latest',
    repository: 'registry.redhat.io/rhel10/rhel-bootc',
    tag: 'latest',
  },
];
