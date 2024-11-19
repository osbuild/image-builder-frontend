import TOML from '@ltd/j-toml';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import {
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  BlueprintItem,
} from './imageBuilderApi';

// we could create an alias for this, something like
// import cockpit from 'cockpit', but this feels like
// a bit of magic and might make the code harder to
// maintain.
import cockpit from '../../pkg/lib/cockpit';
import { fsinfo } from '../../pkg/lib/cockpit/fsinfo';

const emptyCockpitApi = createApi({
  reducerPath: 'cockpitApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});

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
        queryFn: async () => {
          try {
            if (!cockpit) {
              throw new Error('Cockpit API is not available');
            }

            const user = await cockpit.user();

            // we will use the user's `.local` directory
            // to save blueprints used for on-prem
            // TODO: remove the hardcode
            const path = `${user.home}/.local/share/cockpit/image-builder-frontend/blueprints`;

            // we probably don't need any more information other
            // than the entries from the directory
            const info = await fsinfo(path, ['entries'], {
              superuser: 'try',
            });

            const entries = Object.entries(info?.entries || {});
            const blueprints: BlueprintItem[] = await Promise.all(
              entries.map(async ([filename]) => {
                const file = cockpit.file(`${path}/${filename}`);

                const contents = await file.read();
                const parsed = TOML.parse(contents);
                file.close();

                return {
                  name: parsed.name as string,
                  id: parsed.name as string, // TODO: duplicate name case
                  version: parsed.version as number,
                  description: parsed.description as string,
                  last_modified_at: Date.now().toString(),
                };
              })
            );

            return {
              data: {
                meta: { count: blueprints.length },
                links: {
                  // TODO: figure out the pagination
                  first: '',
                  last: '',
                },
                data: blueprints,
              },
            };
          } catch (error) {
            return { error: error.message };
          }
        },
      }),
    };
  },
});

export const { useGetBlueprintsQuery, useGetArchitecturesQuery } = cockpitApi;
