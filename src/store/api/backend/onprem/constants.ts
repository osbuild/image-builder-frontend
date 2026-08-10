import type { BootcDistributionItem } from '@/store/api/backend';

export type KnownImage = Omit<BootcDistributionItem, 'arch'>;

// The repository path holding the official images. Development builds
// (make cockpit/devel DEV_REGISTRY=...) can point it at a registry
// holding unpublished containers; the value is baked in at build time
// via webpack DefinePlugin. Everything derives from this one constant -
// the UI, the wizard state, stored blueprints, podman, and the
// image-builder CLI all use the same references - so a development
// build behaves exactly like a production build pointed at a
// different registry, and the UI always shows the registry that is
// actually used.
export const IMAGE_REGISTRY =
  process.env.DEV_REGISTRY?.replace(/\/+$/, '') || 'registry.redhat.io/rhel10';

// The bare host, for podman login and logout.
export const IMAGE_REGISTRY_HOST = IMAGE_REGISTRY.split('/')[0];

export const KNOWN_IMAGES: KnownImage[] = [
  {
    reference: `${IMAGE_REGISTRY}/rhel-bootc-kvm:latest`,
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'guest-image',
  },
  {
    reference: `${IMAGE_REGISTRY}/rhel-bootc-aws:latest`,
    distro: 'rhel-10.3',
    name: 'Red Hat Enterprise Linux (RHEL) 10.3',
    type: 'aws',
  },
];

export const isKnownImageRef = (ref: string) => {
  return KNOWN_IMAGES.some((known) => known.reference === ref);
};
