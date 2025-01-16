import path from 'path';

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
  DeleteBlueprintApiResponse,
  DeleteBlueprintApiArg,
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

// @ts-ignore TODO: add this type and stub out the result
const api = cockpit.http('/run/cloudapi/api.socket', {
  superuser: 'try',
});

// TODO: we can generalise this a little bit
// and make it re-usable
const request = api
  .request({
    path: '/api/image-builder-composer/v2/distributions',
    body: '',
    headers: { 'Content-Type': 'application/json' },
  })
  .then(JSON.parse)
  .catch((e: any) => {
    return { error: e };
  });

// TODO: this is by no means complete (or completely correct).
// This is just an attempt to get some results. We will need to
// be able to translate these back again in the future when we
// are making image-requests. This may need to be extracted out
// of this file into a general helper
const translateImageTypes = (imageType: string) => {
  switch (imageType) {
    case 'ami':
      return 'aws';
    case 'azure-rhui':
      return 'azure';
    case 'azure-sap-rhui':
      return 'azure';
    case 'ec2':
      return 'aws';
    case 'gce':
      return 'gcp';
    case 'qcow2':
      return 'guest-image';
    default:
      return imageType;
  }
};

export const cockpitApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        queryFn: async ({ distribution }) => {
          const res = await request();
          const distroArches = res[distribution];
          const data = Object.keys(distroArches)
            .map((arch) => {
              const imageTypes = Object.keys(distroArches[arch]).map(
                translateImageTypes
              );
              return {
                arch,
                image_types: imageTypes,
                // TODO: we need to get a Set of repositories here
                // the endpoint returns repositories for each image
                // type
                repositories: [],
              };
            })
            .filter((result) => {
              return result.arch === 'aarch64' || result.arch === 'x86_64';
            });

          return { data };
        },
      }),
      getBlueprints: builder.query<
        GetBlueprintsApiResponse,
        GetBlueprintsApiArg
      >({
        queryFn: async () => {
          try {
            const blueprintsDir = await getBlueprintsPath();

            // we probably don't need any more information other
            // than the entries from the directory
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });

            const entries = Object.entries(info?.entries || {});
            const blueprints: BlueprintItem[] = await Promise.all(
              entries.map(async ([filename]) => {
                const file = cockpit.file(path.join(blueprintsDir, filename));

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
      deleteBlueprint: builder.mutation<
        DeleteBlueprintApiResponse,
        DeleteBlueprintApiArg
      >({
        queryFn: async ({ id: filename }) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const filepath = path.join(blueprintsDir, filename);

            await cockpit.spawn(['rm', filepath], {
              superuser: 'try',
            });

            return {
              data: {},
            };
          } catch (error) {
            return { error };
          }
        },
      }),
    };
  },
});

export const {
  useGetBlueprintsQuery,
  useDeleteBlueprintMutation,
  useGetArchitecturesQuery,
} = cockpitApi;
