import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  GetDistributionApiArg,
  GetDistributionApiResponse,
} from '../../hosted';

export const distributionEndpoints = (builder: OnPremBuilder) => ({
  getDistribution: builder.query<
    GetDistributionApiResponse,
    GetDistributionApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs, baseQuery }) => {
      const params: Record<string, string[]> = {};
      if (queryArgs.imageType?.length) {
        params['image_type'] = queryArgs.imageType;
      }
      if (queryArgs.architecture?.length) {
        params['architecture'] = queryArgs.architecture;
      }

      const result = await baseQuery({
        url: `/distributions/${queryArgs.distro}`,
        method: 'GET',
        params,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data as GetDistributionApiResponse;
    }),
  }),
});
