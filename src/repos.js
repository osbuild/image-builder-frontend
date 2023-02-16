import { RHEL_8, RHEL_9 } from './constants';

export const getDistroRepoUrls = (distro) =>
  repos[distro].map((repo) => repo.url);

export const repos = {
  [RHEL_8]: [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'https://cdn.redhat.com/content/dist/rhel8/8.7/x86_64/baseos/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'appstream',
      url: 'https://cdn.redhat.com/content/dist/rhel8/8.7/x86_64/appstream/os',
    },
  ],
  [RHEL_9]: [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'https://cdn.redhat.com/content/dist/rhel9/9.1/x86_64/baseos/os',
    },
    {
      distribution_arch: 'x86_64',
      name: 'appstream',
      url: 'https://cdn.redhat.com/content/dist/rhel9/9.1/x86_64/appstream/os',
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
  ],
  'centos-9': [
    {
      name: 'baseos',
      distribution_arch: 'x86_64',
      url: 'http://mirror.stream.centos.org/9-stream/BaseOS/x86_64/os/',
    },
    {
      name: 'appstream',
      distribution_arch: 'x86_64',
      url: 'http://mirror.stream.centos.org/9-stream/AppStream/x86_64/os/',
    },
  ],
};
