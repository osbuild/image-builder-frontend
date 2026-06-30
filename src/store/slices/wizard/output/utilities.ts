import { CENTOS_9, RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import { Distributions } from '@/store/api/backend';

export const getLatestRelease = (
  distribution: Distributions,
): Distributions => {
  return distribution.startsWith('rhel-10')
    ? RHEL_10
    : distribution.startsWith('rhel-9')
      ? RHEL_9
      : distribution.startsWith('rhel-8')
        ? RHEL_8
        : distribution === ('centos-8' as Distributions)
          ? CENTOS_9
          : distribution;
};
