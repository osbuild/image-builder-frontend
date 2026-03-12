import cockpit from 'cockpit';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  PodmanImageInfo,
  PodmanImagesArg,
  PodmanImagesResponse,
} from '../types';

export const podmanEndpoints = (builder: OnPremBuilder) => ({
  podmanImages: builder.query<PodmanImagesResponse, PodmanImagesArg>({
    queryFn: onPremQueryHandler(async () => {
      const result = (await cockpit.spawn(
        [
          'podman',
          'images',
          '--filter',
          'reference=registry.redhat.io/rhel*/rhel-bootc',
          '--format',
          '{{.Repository}},{{.Tag}}',
        ],
        {
          superuser: 'require',
        },
      )) as string;

      if (!result.trim()) {
        return [];
      }

      const images = result
        .trim()
        .split('\n')
        .map((s) => {
          if (!s.trim()) {
            return null;
          }

          const parts = s.trim().split(',');
          if (parts.length !== 2) {
            // Skip malformed lines that don't match "repository,tag"
            return null;
          }

          const [repository, tag] = parts.map((p) => p.trim());
          if (!repository || !tag) {
            return null;
          }

          return {
            image: `${repository}:${tag}`,
            repository,
            tag,
          };
        })
        .filter((image): image is PodmanImageInfo => image !== null);

      return images;
    }),
  }),
});
