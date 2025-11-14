import React from 'react';

import { Distributions } from '../../store/imageBuilderApi';

type ReleaseProps = {
  release: Distributions;
};

const Release = ({ release }: ReleaseProps) => {
  const releaseDisplayValue = {
    'rhel-8': 'RHEL 8',
    'rhel-8-nightly': 'RHEL 8',
    'rhel-84': 'RHEL 8.4',
    'rhel-85': 'RHEL 8.5',
    'rhel-86': 'RHEL 8.6',
    'rhel-87': 'RHEL 8.7',
    'rhel-88': 'RHEL 8.8',
    'rhel-89': 'RHEL 8.9',
    'rhel-8.10': 'RHEL 8.10',
    'rhel-9': 'RHEL 9',
    'rhel-9-beta': 'RHEL 9 Beta',
    'rhel-9-nightly': 'RHEL 9',
    'rhel-9.6-nightly': 'RHEL 9',
    'rhel-9.7-nightly': 'RHEL 9',
    'rhel-9.8-nightly': 'RHEL 9',
    'rhel-90': 'RHEL 9.0',
    'rhel-91': 'RHEL 9.1',
    'rhel-92': 'RHEL 9.2',
    'rhel-93': 'RHEL 9.3',
    'rhel-94': 'RHEL 9.4',
    'rhel-95': 'RHEL 9.5',
    'rhel-9.6': 'RHEL 9.6',
    'rhel-9.7': 'RHEL 9.7',
    'rhel-10': 'RHEL 10',
    'rhel-10.0': 'RHEL 10.0',
    'rhel-10.1': 'RHEL 10.1',
    'rhel-10-nightly': 'RHEL 10',
    'rhel-10.0-nightly': 'RHEL 10',
    'rhel-10.1-nightly': 'RHEL 10',
    'rhel-10.2-nightly': 'RHEL 10',
    'rhel-10-beta': 'RHEL 10 Beta',
    'centos-8': 'CentOS Stream 8',
    'centos-9': 'CentOS Stream 9',
    'centos-10': 'CentOS Stream 10',
    'fedora-35': 'Fedora 35',
    'fedora-36': 'Fedora 36',
    'fedora-37': 'Fedora 37',
    'fedora-38': 'Fedora 38',
    'fedora-39': 'Fedora 39',
    'fedora-40': 'Fedora 40',
    'fedora-41': 'Fedora 41',
    'fedora-42': 'Fedora 42',
    'fedora-43': 'Fedora 43',
    'fedora-44': 'Fedora 44',
  };

  return <p>{releaseDisplayValue[release]}</p>;
};

export default Release;
