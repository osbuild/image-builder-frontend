// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import toml from 'toml';

import { emptyCockpitApi } from './emptyCockpitApi';
import {
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  BlueprintItem,
} from './imageBuilderApi';

import { mapOnPremToHosted } from '../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { BLUEPRINTS_DIR } from '../constants';

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
                const parsed = toml.parse(contents);
                file.close();

                const blueprint = mapOnPremToHosted(parsed);
                const version = (parsed.version as number) ?? 1;
                return {
                  ...blueprint,
                  id: filename as string,
                  version: Math.floor(version),
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
