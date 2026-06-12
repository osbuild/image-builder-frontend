import { Architectures, BootcDistributionItem } from '@/store/api/backend';

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

export const mockBootcDistributions: BootcDistributionItem[] = [
  {
    distro: 'rhel-10',
    name: 'Red Hat Enterprise Linux (RHEL) 10',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
  },
  {
    distro: 'rhel-9',
    name: 'Red Hat Enterprise Linux (RHEL) 9',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
  },
];

export const mockBootcDistributionsNoRhel10: BootcDistributionItem[] = [
  {
    distro: 'rhel-9',
    name: 'Red Hat Enterprise Linux (RHEL) 9',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
  },
  {
    distro: 'rhel-8',
    name: 'Red Hat Enterprise Linux (RHEL) 8',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel8/rhel-bootc:rhel-8',
  },
];

export const mockBootcDistributionsWithMinorVersions: BootcDistributionItem[] =
  [
    {
      distro: 'rhel-10',
      name: 'Red Hat Enterprise Linux (RHEL) 10',
      type: 'guest-image',
      arch: 'x86_64',
      reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
    },
    {
      distro: 'rhel-10.1',
      name: 'Red Hat Enterprise Linux (RHEL) 10.1',
      type: 'guest-image',
      arch: 'x86_64',
      reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10.1',
    },
    {
      distro: 'rhel-9',
      name: 'Red Hat Enterprise Linux (RHEL) 9',
      type: 'guest-image',
      arch: 'x86_64',
      reference: 'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
    },
  ];

export const mockBootcDistributionsMultipleTypes: BootcDistributionItem[] = [
  {
    distro: 'rhel-10',
    name: 'Red Hat Enterprise Linux (RHEL) 10',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
  },
  {
    distro: 'rhel-10',
    name: 'Red Hat Enterprise Linux (RHEL) 10',
    type: 'aws',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
  },
];

export const mockBootcDistributionsMixed: BootcDistributionItem[] = [
  {
    distro: 'rhel-10',
    name: 'Red Hat Enterprise Linux (RHEL) 10',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
  },
  {
    distro: 'fedora-42',
    name: 'Fedora 42',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'quay.io/fedora/fedora-bootc:42',
  },
  {
    distro: 'centos-10',
    name: 'CentOS Stream 10',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'quay.io/centos-bootc/centos-bootc:stream10',
  },
  {
    distro: 'unknown-custom',
    name: 'localhost/my-custom-image:latest',
    type: 'guest-image',
    arch: 'x86_64',
    reference: 'localhost/my-custom-image:latest',
  },
];
