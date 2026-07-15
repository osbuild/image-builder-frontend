import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { getHostArch, getHostDistro } from './helpers';

import type { Distributions, ImageRequest } from '../../hosted';

type HostInfo = {
  arch: ImageRequest['architecture'];
  distro: Distributions;
};

export const hostEndpoints = (builder: OnPremBuilder) => ({
  getHostInfo: builder.query<HostInfo, void>({
    queryFn: onPremQueryHandler(async () => {
      const [distro, arch] = await Promise.all([
        getHostDistro(),
        getHostArch(),
      ]);

      return {
        distro,
        arch,
      };
    }),
  }),
});
