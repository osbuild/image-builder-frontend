import { type OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  byDistroDescending,
  filterBootcImages,
  getCloudConfigs,
  listPodmanImages,
  parseJsonUnsafe,
  toBootcDistro,
} from './helpers';
import { normalizeArch, podmanInspect } from './helpers/podman';

import {
  GetArchitecturesApiArg,
  GetArchitecturesApiResponse,
  GetDistributionsApiArg,
  GetDistributionsApiResponse,
} from '../../hosted';
import { PodmanImageInfo } from '../types';

export const architectureEndpoints = (builder: OnPremBuilder) => ({
  getDistributions: builder.query<
    GetDistributionsApiResponse,
    GetDistributionsApiArg
  >({
    // The on-prem endpoint only uses `arch` to filter podman images,
    // so we normalize the cache key to avoid redundant podman spawns
    // when consumers pass different optional params (e.g. distro).
    serializeQueryArgs: ({ queryArgs }) => ({ arch: queryArgs.arch }),
    queryFn: onPremQueryHandler(async ({ queryArgs: { arch } }) => {
      const result = await listPodmanImages();
      const parsed = parseJsonUnsafe<PodmanImageInfo[]>(result);

      if (!Array.isArray(parsed)) {
        throw new Error('Unexpected podman images output');
      }

      const ids = parsed.map((img) => img.Id);
      const inspect = await podmanInspect(ids);
      const images = parseJsonUnsafe<PodmanImageInfo>(inspect);

      if (!Array.isArray(images)) {
        throw new Error('Unexpected podman images output');
      }

      return images
        .map((img) => ({
          ...img,
          Architecture: normalizeArch(img.Architecture ?? arch),
        }))
        .filter(filterBootcImages)
        .map(toBootcDistro)
        .sort(byDistroDescending);
    }),
  }),
  getArchitectures: builder.query<
    GetArchitecturesApiResponse,
    GetArchitecturesApiArg
  >({
    queryFn: onPremQueryHandler(async () => {
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
