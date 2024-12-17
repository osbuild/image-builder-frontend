import { emptyCockpitApi } from './emptyCockpitApi';
import {
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
} from './imageBuilderApi';

export const cockpitApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        query: (queryArg) => ({
          url: `/architectures/${queryArg.distribution}`,
        }),
      }),
      getBlueprints: builder.query<
        GetBlueprintsApiResponse,
        GetBlueprintsApiArg
      >({
        queryFn: () => {
          // TODO: Add cockpit file api support for reading in blueprints.
          // For now we're just hardcoding a dummy response
          // so we can render an empty table.
          return new Promise((resolve) => {
            resolve({
              data: {
                meta: { count: 0 },
                links: {
                  first: '',
                  last: '',
                },
                data: [],
              },
            });
          });
        },
      }),
    };
  },
});

export const { useGetBlueprintsQuery, useGetArchitecturesQuery } = cockpitApi;
