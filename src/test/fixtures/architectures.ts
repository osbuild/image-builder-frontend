import { Architectures, Distributions } from '../../store/imageBuilderApi';

export const mockArchitecturesByDistro = (
  distro: Distributions,
): Architectures => {
  const mockDistros: { [key: string]: Architectures } = {
    'rhel-10': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'azure',
          'gcp',
          'guest-image',
          'image-installer',
          'network-installer',
          'oci',
          'wsl',
        ],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/baseos/os',
            rhsm: true,
          },
        ],
      },
      {
        arch: 'aarch64',
        image_types: ['aws', 'guest-image', 'image-installer'],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel10/10/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ],
    'rhel-9': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'gcp',
          'azure',
          'oci',
          'rhel-edge-commit',
          'rhel-edge-installer',
          'edge-commit',
          'edge-installer',
          'guest-image',
          'image-installer',
          'vsphere',
          'vsphere-ova',
        ],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel9/9/x86_64/baseos/os',
            rhsm: true,
          },
        ],
      },
      {
        arch: 'aarch64',
        image_types: ['aws', 'guest-image', 'image-installer'],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel9/9/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ],
    'rhel-8': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'gcp',
          'azure',
          'oci',
          'rhel-edge-commit',
          'rhel-edge-installer',
          'edge-commit',
          'edge-installer',
          'guest-image',
          'image-installer',
          'vsphere',
          'vsphere-ova',
          'wsl',
        ],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel8/8/x86_64/baseos/os',
            rhsm: true,
          },
        ],
      },
      {
        arch: 'aarch64',
        image_types: ['aws', 'guest-image', 'image-installer'],
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel8/8/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ],
    'centos-9': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'gcp',
          'azure',
          'ami',
          'vhd',
          'guest-image',
          'image-installer',
          'vsphere',
          'vsphere-ova',
        ],
        repositories: [
          {
            baseurl:
              'http://mirror.centos.org/centos/9-stream/BaseOS/x86_64/os/',
            rhsm: false,
          },
        ],
      },
      {
        arch: 'aarch64',
        image_types: ['aws', 'guest-image', 'image-installer'],
        repositories: [
          {
            baseurl:
              'http://mirror.centos.org/centos/9-stream/BaseOS/aarch64/os/',
            rhsm: false,
          },
        ],
      },
    ],
  };
  return mockDistros[distro];
};
