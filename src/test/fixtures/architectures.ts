import { Architectures, Distributions } from '../../store/imageBuilderApi';

export const mockArchitecturesByDistro = (
  distro: Distributions
): Architectures => {
  const mockDistros: { [key: string]: Architectures } = {
    'rhel-93': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'gcp',
          'azure',
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
              'https://cdn.redhat.com/content/dist/rhel9/9.2/x86_64/baseos/os',
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
              'https://cdn.redhat.com/content/dist/rhel9/9.2/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ],
    'rhel-88': [
      {
        arch: 'x86_64',
        image_types: [
          'aws',
          'gcp',
          'azure',
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
              'https://cdn.redhat.com/content/dist/rhel8/8.8/x86_64/baseos/os',
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
              'https://cdn.redhat.com/content/dist/rhel8/8.8/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ],
    'centos-8': [
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
              'http://mirror.centos.org/centos/8-stream/BaseOS/x86_64/os/',
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
              'http://mirror.centos.org/centos/8-stream/BaseOS/aarch64/os/',
            rhsm: false,
          },
        ],
      },
    ],
  };
  return mockDistros[distro];
};
