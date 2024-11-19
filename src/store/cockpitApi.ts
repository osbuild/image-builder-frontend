import TOML from '@ltd/j-toml';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import cockpit from 'cockpit';
import { fsinfo } from 'fsinfo';

import {
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  BlueprintItem,
} from './imageBuilderApi';

import { BLUEPRINTS_DIR } from '../constants';

const emptyCockpitApi = createApi({
  reducerPath: 'cockpitApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});

const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

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
            const path = await getBlueprintsPath();

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

                // TODO: add other blueprint options
                return {
                  name: parsed.name as string,
                  id: filename as string,
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
            return { error };
          }
        },
      }),
    };
  },
});

export const { useGetBlueprintsQuery, useGetArchitecturesQuery } = cockpitApi;
