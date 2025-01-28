import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { v4 as uuidv4 } from 'uuid';

import { emptyCockpitApi } from './emptyCockpitApi';

import { mapHostedToOnPrem } from '../../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { BLUEPRINTS_DIR } from '../../constants';
import {
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
} from '../service/contentSourcesApi';
import {
  ComposeBlueprintApiResponse,
  ComposeBlueprintApiArg,
  CreateBlueprintRequest,
  ComposesResponseItem,
  GetArchitecturesApiResponse,
  GetArchitecturesApiArg,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  GetBlueprintComposesApiArg,
  GetBlueprintComposesApiResponse,
  GetComposesApiArg,
  GetComposesApiResponse,
  GetComposeStatusApiArg,
  GetComposeStatusApiResponse,
  DeleteBlueprintApiResponse,
  DeleteBlueprintApiArg,
  BlueprintItem,
  GetOscapProfilesApiArg,
  GetOscapProfilesApiResponse,
  GetBlueprintApiResponse,
  GetBlueprintApiArg,
  CreateBlueprintApiResponse,
  CreateBlueprintApiArg,
  ComposeResponse,
} from '../service/imageBuilderApi';

const getBlueprintsPath = async () => {
  const user = await cockpit.user();

  // we will use the user's `.local` directory
  // to save blueprints used for on-prem
  return `${user.home}/${BLUEPRINTS_DIR}`;
};

const readComposes = async (bpID: string) => {
  const blueprintsDir = await getBlueprintsPath();
  let composes: ComposesResponseItem[] = [];
  const bpInfo = await fsinfo(
    path.join(blueprintsDir, bpID),
    ['entries', 'mtime'],
    {
      superuser: 'try',
    }
  );
  const bpEntries = Object.entries(bpInfo?.entries || {});
  for (const entry of bpEntries) {
    if (entry[0] === `${bpID}.json`) {
      continue;
    }
    const composeReq = await cockpit
      .file(path.join(blueprintsDir, bpID, entry[0]))
      .read();
    composes = [
      ...composes,
      {
        id: entry[0],
        request: JSON.parse(composeReq),
        created_at: new Date(entry[1]!.mtime * 1000).toString(),
        blueprint_id: bpID,
      },
    ];
  }
  return composes;
};

export const cockpitApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        queryFn: () => {
          // TODO: this is hardcoded for now, but we may need to query
          // the cloudapi endpoint on the composer socket to get the
          // available information
          return {
            data: [
              {
                arch: 'aarch64',
                image_types: ['guest-image', 'image-installer'],
                repositories: [],
              },
              {
                arch: 'x86_64',
                image_types: [
                  'rhel-edge-commit',
                  'rhel-edge-installer',
                  'edge-commit',
                  'edge-installer',
                  'guest-image',
                  'image-installer',
                  'vsphere',
                  'vsphere-ova',
                ],
                repositories: [],
              },
            ],
          };
        },
      }),
      getBlueprint: builder.query<GetBlueprintApiResponse, GetBlueprintApiArg>({
        queryFn: async ({ id, version }) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const bpPath = path.join(blueprintsDir, id, `${id}.json`);
            const bpInfo = await fsinfo(bpPath, ['mtime'], {
              superuser: 'try',
            });
            const contents = await cockpit.file(bpPath).read();
            const parsed = JSON.parse(contents);
            return {
              data: {
                ...parsed,
                id,
                version: version,
                last_modified_at: new Date(bpInfo!.mtime * 1000).toString(),
              },
            };
          } catch (error) {
            return { error };
          }
        },
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
                return {
                  ...parsed,
                  id: filename as string,
                  version: 1,
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
      createBlueprint: builder.mutation<
        CreateBlueprintApiResponse,
        CreateBlueprintApiArg
      >({
        queryFn: async ({ createBlueprintRequest: blueprintReq }) => {
          try {
            const id = uuidv4();
            const blueprintsDir = await getBlueprintsPath();
            await cockpit.spawn(
              ['mkdir', '-p', path.join(blueprintsDir, id)],
              {}
            );
            await cockpit
              .file(path.join(blueprintsDir, id, `${id}.json`))
              .replace(JSON.stringify(blueprintReq));
            return {
              data: {
                id: id,
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
      getOscapProfiles: builder.query<
        GetOscapProfilesApiResponse,
        GetOscapProfilesApiArg
      >({
        queryFn: async () => {
          // TODO: make a call to get the openscap profiles
          // For now, just return an empty list so we can
          // step through the wizard.
          return {
            data: [],
          };
        },
      }),
      // add an empty response for now
      // just so we can step through the create
      // image wizard for on prem
      listSnapshotsByDate: builder.mutation<
        ListSnapshotsByDateApiResponse,
        ListSnapshotsByDateApiArg
      >({
        queryFn: () => ({
          data: {
            data: [],
          },
        }),
      }),
      composeBlueprint: builder.mutation<
        ComposeBlueprintApiResponse,
        ComposeBlueprintApiArg
      >({
        queryFn: async ({ id: filename }, _, __, baseQuery) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const file = cockpit.file(
              path.join(blueprintsDir, filename, `${filename}.json`)
            );
            const contents = await file.read();
            const parsed = JSON.parse(contents);

            const createBPReq = parsed as CreateBlueprintRequest;
            const blueprint = mapHostedToOnPrem(createBPReq);
            const composes: ComposeResponse[] = [];
            for (const ir of parsed.image_requests) {
              const composeReq = {
                distribution: createBPReq.distribution,
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
                distribution: createBPReq.distribution,
                blueprint: parsed,
                image_requests: [
                  {
                    architecture: ir.architecture,
                    image_type: ir.image_type,
                    repositories: [],
                    upload_request: {
                      type: 'local',
                      options: {},
                    },
                  },
                ],
              };
              const composeResp = await baseQuery({
                url: '/api/image-builder-composer/v2/compose',
                method: 'POST',
                body: composeReq,
                headers: {
                  'content-type': 'application/json',
                },
              });
              await cockpit
                .file(path.join(blueprintsDir, filename, composeResp.data?.id))
                .replace(JSON.stringify(saveReq));
              composes.push({ id: composeResp.data?.id });
            }
            return {
              data: composes,
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getComposes: builder.query<GetComposesApiResponse, GetComposesApiArg>({
        queryFn: async () => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });
            let composes: ComposesResponseItem[] = [];
            const entries = Object.entries(info?.entries || {});
            for (const entry of entries) {
              composes = composes.concat(await readComposes(entry[0]));
            }
            return {
              data: {
                meta: {
                  count: composes.length,
                },
                links: {
                  first: composes.length > 0 ? composes[0].id : '',
                  last:
                    composes.length > 0 ? composes[composes.length - 1].id : '',
                },
                data: composes,
              },
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getBlueprintComposes: builder.query<
        GetBlueprintComposesApiResponse,
        GetBlueprintComposesApiArg
      >({
        queryFn: async (queryArgs) => {
          try {
            const composes = await readComposes(queryArgs.id);
            return {
              data: {
                meta: {
                  count: composes.length,
                },
                links: {
                  first: composes.length > 0 ? composes[0].id : '',
                  last:
                    composes.length > 0 ? composes[composes.length - 1].id : '',
                },
                data: composes,
              },
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getComposeStatus: builder.query<
        GetComposeStatusApiResponse,
        GetComposeStatusApiArg
      >({
        queryFn: async (queryArg, _, __, baseQuery) => {
          try {
            const resp = await baseQuery({
              url: `/api/image-builder-composer/v2/composes/${queryArg.composeId}`,
              method: 'GET',
            });
            const blueprintsDir = await getBlueprintsPath();
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });
            const entries = Object.entries(info?.entries || {});
            for (const bpEntry of entries) {
              const request = await cockpit
                .file(path.join(blueprintsDir, bpEntry[0], queryArg.composeId))
                .read();
              return {
                data: {
                  image_status: resp.data?.image_status,
                  request: JSON.parse(request),
                },
              };
            }
            return {
              data: {
                image_status: '',
                request: {},
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

export const {
  useGetArchitecturesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useDeleteBlueprintMutation,
  useGetOscapProfilesQuery,
  useListSnapshotsByDateMutation,
  useComposeBlueprintMutation,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
} = cockpitApi;
