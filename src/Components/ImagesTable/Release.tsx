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
    'rhel-9': 'RHEL 9',
    'rhel-9-nightly': 'RHEL 9',
    'rhel-90': 'RHEL 9.0',
    'rhel-91': 'RHEL 9.1',
    'rhel-92': 'RHEL 9.2',
    'centos-8': 'CentOS Stream 8',
    'centos-9': 'CentOS Stream 9',
    'fedora-35': 'Fedora 35',
    'fedora-36': 'Fedora 36',
    'fedora-37': 'Fedora 37',
    'fedora-38': 'Fedora 38',
    'fedora-39': 'Fedora 39',
  };

  return <p>{releaseDisplayValue[release]}</p>;
};

export default Release;
