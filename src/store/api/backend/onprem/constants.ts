import type { BootcDistributionItem } from '@/store/api/backend';

export type KnownImage = Omit<BootcDistributionItem, 'arch'>;

export const KNOWN_IMAGES: KnownImage[] = [
  {
    reference: 'registry.redhat.io/rhel10/rhel-bootc:latest',
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'guest-image',
  },
];

export const isKnownImageRef = (ref: string) => {
  return KNOWN_IMAGES.some((known) => known.reference === ref);
};
