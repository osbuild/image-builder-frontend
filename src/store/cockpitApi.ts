// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
/* eslint-disable @typescript-eslint/no-unused-vars */
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

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
