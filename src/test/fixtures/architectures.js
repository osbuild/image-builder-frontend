export const mockArchitecturesByDistro = (distro) => {
  if (distro === 'rhel-92') {
    return [
      {
        arch: 'x86_64',
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
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel9/9.2/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ];
  } else if (distro === 'rhel-87') {
    return [
      {
        arch: 'x86_64',
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel8/8.7/x86_64/baseos/os',
            rhsm: true,
          },
        ],
      },
      {
        arch: 'aarch64',
        repositories: [
          {
            baseurl:
              'https://cdn.redhat.com/content/dist/rhel8/8.7/aarch64/baseos/os',
            rhsm: true,
          },
        ],
      },
    ];
  } else if (distro === 'centos-8') {
    return [
      {
        arch: 'x86_64',
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
        repositories: [
          {
            baseurl:
              'http://mirror.centos.org/centos/8-stream/BaseOS/aarch64/os/',
            rhsm: false,
          },
        ],
      },
    ];
  }
};
