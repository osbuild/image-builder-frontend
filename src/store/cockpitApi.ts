import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { read_os_release } from 'os-release';

import { emptyCockpitApi } from './emptyCockpitApi';
import {
  ComposeBlueprintApiResponse,
  ComposeBlueprintApiArg,
  CreateBlueprintRequest,
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  DeleteBlueprintApiResponse,
  DeleteBlueprintApiArg,
  BlueprintItem,
  ComposeResponse,
} from './imageBuilderApi';

import { mapHostedToOnPrem } from '../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
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
        queryFn: async (queryArgs) => {
          try {
            const { name, search, offset, limit } = queryArgs;

            const blueprintsDir = await getBlueprintsPath();

            // we probably don't need any more information other
            // than the entries from the directory
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });

            const entries = Object.entries(info?.entries || {});
            let blueprints: BlueprintItem[] = await Promise.all(
              entries.map(async ([filename]) => {
                const file = cockpit.file(
                  path.join(blueprintsDir, filename, `${filename}.json`)
                );

                const contents = await file.read();
                const parsed = JSON.parse(contents);
                file.close();

                const version = (parsed.version as number) ?? 1;
                return {
                  ...parsed,
                  id: filename as string,
                  version: version,
                  last_modified_at: Date.now().toString(),
                };
              })
            );

            blueprints = blueprints.filter((blueprint) => {
              if (name) {
                return blueprint.name === name;
              }

              if (search) {
                // TODO: maybe add other params to the search filter
                return blueprint.name.includes(search);
              }

              return true;
            });

            let paginatedBlueprints = blueprints;
            if (offset !== undefined && limit !== undefined) {
              paginatedBlueprints = blueprints.slice(offset, offset + limit);
            }

            let first = '';
            let last = '';

            if (blueprints.length > 0) {
              first = blueprints[0].id;
              last = blueprints[blueprints.length - 1].id;
            }

            return {
              data: {
                meta: { count: blueprints.length },
                links: {
                  // These are kind of meaningless for the on-prem
                  // version
                  first: first,
                  last: last,
                },
                data: paginatedBlueprints,
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
      composeBlueprint: builder.mutation<
        ComposeBlueprintApiResponse,
        ComposeBlueprintApiArg
      >({
        queryFn: async ({ id: filename }) => {
          const blueprintsDir = await getBlueprintsPath();
          const file = cockpit.file(
            path.join(blueprintsDir, filename, `${filename}.json`)
          );
          const contents = await file.read();
          file.close();
          const parsed = JSON.parse(contents);

          const cloudapi = cockpit.http('/run/cloudapi/api.socket', {
            superuser: 'try',
          });

          const blueprint = mapHostedToOnPrem(parsed as CreateBlueprintRequest);

          const osRel = await read_os_release();
          const distro = `${osRel.ID}-${osRel.VERSION_ID}`;
          const composes: ComposeResponse[] = [];
          for (const ir of parsed.image_requests) {
            const composeReq = {
              distribution: distro,
              blueprint: blueprint,
              image_requests: [
                {
                  architecture: ir.architecture,
                  image_type: ir.image_type,
                  repositories: [],
                  upload_targets: [
                    {
                      type: 'local',
                      upload_options: {},
                    },
                  ],
                },
              ],
            };
            const saveReq = {
              distribution: distro,
              blueprint: parsed,
              image_requests: [
                {
                  architecture: 'x86_64',
                  image_type: 'guest-image',
                  repositories: [],
                  upload_request: {
                    type: 'local',
                    options: {},
                  },
                },
              ],
            };
            const resp = await cloudapi.post(
              '/api/image-builder-composer/v2/compose',
              composeReq,
              {
                'content-type': 'application/json',
              }
            );
            const composeResp = JSON.parse(resp);
            await cockpit
              .file(path.join(blueprintsDir, filename, composeResp.id))
              .replace(JSON.stringify(saveReq));
            composes.push({ id: composeResp.id });
          }
          return {
            data: composes,
          };
        },
      }),
    };
  },
});

export const {
  useGetBlueprintsQuery,
  useDeleteBlueprintMutation,
  useGetArchitecturesQuery,
  useComposeBlueprintMutation,
} = cockpitApi;
