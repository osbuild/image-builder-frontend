import { IMAGE_MODE } from '@/constants';
import { GetArchitecturesApiResponse } from '@/store/api/backend/hosted';
import { type OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { getCloudConfigs } from './helpers';

import { ComposerGetArchitecturesApiArg } from '../types';

export const architectureEndpoints = (builder: OnPremBuilder) => ({
  getArchitectures: builder.query<
    GetArchitecturesApiResponse,
    ComposerGetArchitecturesApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs: { distribution } }) => {
      if (distribution === IMAGE_MODE) {
        return [
          {
            arch: 'aarch64',
            image_types: ['guest-image'],
            repositories: [],
          },
          {
            arch: 'x86_64',
            image_types: ['guest-image'],
            repositories: [],
          },
        ];
      }

      const cloudImageTypes = await getCloudConfigs();
      return [
        {
          arch: 'aarch64',
          image_types: [
            'guest-image',
            'image-installer',
            'network-installer',
            'pxe-tar-xz',
            ...cloudImageTypes,
          ],
          repositories: [],
        },
        {
          arch: 'x86_64',
          image_types: [
            'rhel-edge-commit',
            'rhel-edge-installer',
            'edge-commit',
            'edge-installer',
            'guest-image',
            'image-installer',
            'network-installer',
            'pxe-tar-xz',
            'vsphere',
            'vsphere-ova',
            ...cloudImageTypes,
          ],
          repositories: [],
        },
      ];
    }),
  }),
});
