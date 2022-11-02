import { RHEL_8, RHEL_9 } from './constants';

export const repos = {
  [RHEL_8]: [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'https://cdn.redhat.com/content/dist/rhel8/8.6/x86_64/baseos/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'appstream',
      url: 'https://cdn.redhat.com/content/dist/rhel8/8.6/x86_64/appstream/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'google-compute-engine',
      url: 'https://packages.cloud.google.com/yum/repos/google-compute-engine-el8-x86_64-stable',
    },
    {
      distribution_arch: 'x86_64',
      name: 'rhel-86-google-cloud-sdk',
      url: 'https://packages.cloud.google.com/yum/repos/cloud-sdk-el8-x86_64',
    },
  ],
  [RHEL_9]: [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'https://cdn.redhat.com/content/dist/rhel9/9.0/x86_64/baseos/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'appstream',
      url: 'https://cdn.redhat.com/content/dist/rhel9/9.0/x86_64/appstream/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'google-compute-engine',
      url: 'https://packages.cloud.google.com/yum/repos/google-compute-engine-el9-x86_64-stable',
    },
    {
      distribution_arch: 'x86_64',
      name: 'google-cloud-sdk',
      url: 'https://packages.cloud.google.com/yum/repos/cloud-sdk-el9-x86_64',
    },
  ],
  'centos-8': [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/8-stream/BaseOS/x86_64/os/',
    },
    {
      name: 'appstream',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/8-stream/AppStream/x86_64/os/',
    },
    {
      name: 'extras',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/8-stream/extras/x86_64/os/',
    },
    {
      name: 'google-compute-engine',
      distribution_arch: 'x86_64',
      url: 'https://packages.cloud.google.com/yum/repos/google-compute-engine-el8-x86_64-stable',
    },
    {
      name: 'google-cloud-sdk',
      distribution_arch: 'x86_64',
      url: 'https://packages.cloud.google.com/yum/repos/cloud-sdk-el8-x86_64',
    },
  ],
  'centos-9': [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/9-stream/BaseOS/x86_64/os/',
    },
    {
      name: 'appstream',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/9-stream/AppStream/x86_64/os/',
    },
    {
      name: 'extras',
      distribution_arch: 'x86_64',
      url: 'http://mirror.centos.org/centos/9-stream/extras/x86_64/os/',
    },
    {
      name: 'google-compute-engine',
      distribution_arch: 'x86_64',
      url: 'https://packages.cloud.google.com/yum/repos/google-compute-engine-el9-x86_64-stable',
    },
    {
      name: 'google-cloud-sdk',
      distribution_arch: 'x86_64',
      url: 'https://packages.cloud.google.com/yum/repos/cloud-sdk-el9-x86_64',
    },
  ],
};
