import { DISTRO_DETAILS } from './constants';
import {
  DistributionDetails,
  DistributionDetailsCustomizationApi,
  DistributionDetailsCustomizationArgs,
} from './types';

import { imageBuilderApi } from '../imageBuilderApi';

export const distroDetailsApi = imageBuilderApi.injectEndpoints({
  endpoints: (builder) => ({
    getDistributionDetails: builder.query<
      DistributionDetailsCustomizationApi,
      DistributionDetailsCustomizationArgs
    >({
      queryFn: ({ distro, architecture, imageType }) => {
        const data: DistributionDetails = {
          name: distro,
          architectures: {},
        };

        // we define this above, so it's not undefined
        const architectures = data.architectures!;
        for (const arch of architecture) {
          architectures[arch] = {
            name: arch,
            image_types: {},
          };
          for (const it of imageType) {
            // eslint complains about this always being truthy, it's not a
            // complete list of image types, so there is a change it is undefined
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (DISTRO_DETAILS[it]) {
              architectures[arch].image_types![it] = DISTRO_DETAILS[it];
            }
          }
        }
        data.architectures = architectures;

        return {
          data,
        };
      },
    }),
  }),
});
