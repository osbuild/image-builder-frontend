import { Architectures } from '@/store/api/backend';

export const mockArchitectures: Record<string, Architectures> = {
  'rhel-8': [
    {
      arch: 'x86_64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
  ],
  'rhel-9': [
    {
      arch: 'x86_64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
  ],
  'rhel-10': [
    {
      arch: 'x86_64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
    {
      arch: 'aarch64',
      image_types: ['guest-image', 'image-installer'],
      repositories: [],
    },
  ],
};
