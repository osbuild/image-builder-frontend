import { OnPremApiError } from '@/store/api/shared';

export const lookupDatastreamDistro = (distribution: string): string => {
  if (distribution.startsWith('fedora')) {
    return 'fedora';
  }

  if (distribution === 'centos-9') {
    return 'cs9';
  }

  if (distribution === 'centos-10') {
    return 'cs10';
  }

  if (distribution === 'rhel-9') {
    return 'rhel9';
  }

  if (distribution === 'rhel-10') {
    return 'rhel10';
  }

  throw new OnPremApiError(`Unknown distribution: ${distribution}`);
};
