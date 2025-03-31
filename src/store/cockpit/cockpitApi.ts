import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import TOML, { Section } from '@ltd/j-toml';
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { v4 as uuidv4 } from 'uuid';

// We have to work around RTK query here, since it doesn't like splitting
// out the same api into two separate apis. So, instead, we can just
// inherit/import the `contentSourcesApi` and build on top of that.
// This is fine since all the api endpoints for on-prem should query
// the same unix socket. This allows us to split out the code a little
// bit so that the `cockpitApi` doesn't become a monolith.
import { contentSourcesApi } from './contentSourcesApi';
import type {
  UpdateWorkerConfigApiArg,
  WorkerConfigFile,
  WorkerConfigResponse,
} from './types';

import {
  mapHostedToOnPrem,
  mapOnPremToHosted,
} from '../../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { BLUEPRINTS_DIR } from '../../constants';
import {
  BlueprintItem,
  ComposeBlueprintApiArg,
  ComposeBlueprintApiResponse,
  ComposeResponse,
  ComposesResponseItem,
  CreateBlueprintApiArg,
  CreateBlueprintApiResponse,
  CreateBlueprintRequest,
  DeleteBlueprintApiArg,
  DeleteBlueprintApiResponse,
  DistributionProfileItem,
  GetArchitecturesApiArg,
  GetArchitecturesApiResponse,
  GetBlueprintApiArg,
  GetBlueprintApiResponse,
  GetBlueprintComposesApiArg,
  GetBlueprintComposesApiResponse,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  GetComposesApiArg,
  GetComposesApiResponse,
  GetComposeStatusApiArg,
  GetComposeStatusApiResponse,
  GetOscapCustomizationsApiArg,
  GetOscapCustomizationsApiResponse,
  GetOscapProfilesApiArg,
  GetOscapProfilesApiResponse,
  UpdateBlueprintApiArg,
  UpdateBlueprintApiResponse,
} from '../service/imageBuilderApi';

const lookupDatastreamDistro = (distribution: string) => {
  if (distribution.startsWith('fedora')) {
    return 'fedora';
  }

  if (distribution === 'centos-9') {
    return 'cs9';
  }

  if (distribution === 'centos-10') {
    return 'cs10';
  }

  if (distribution === 'rhel-9') {
    return 'rhel9';
  }

  if (distribution === 'rhel-10') {
    return 'rhel10';
  }

  throw 'Unknown distribution';
};

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

const getCloudConfigs = async () => {
  try {
    const worker_config = cockpit.file(
      '/etc/osbuild-worker/osbuild-worker.toml'
    );
    const contents = await worker_config.read();
    const parsed = TOML.parse(contents);
    return Object.keys(parsed).filter((k) => k === 'aws');
  } catch {
    return [];
  }
};

export const cockpitApi = contentSourcesApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        queryFn: async () => {
          try {
            const cloudImageTypes = await getCloudConfigs();
            return {
              data: [
                {
                  arch: 'aarch64',
                  image_types: [
                    'guest-image',
                    'image-installer',
                    ...cloudImageTypes,
                  ],
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
                    ...cloudImageTypes,
                  ],
                  repositories: [],
                },
              ],
            };
          } catch (error) {
            return { error };
          }
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
                // linting is not supported on prem
                lint: {
                  errors: [],
                },
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
      updateBlueprint: builder.mutation<
        UpdateBlueprintApiResponse,
        UpdateBlueprintApiArg
      >({
        queryFn: async ({ id: id, createBlueprintRequest: blueprintReq }) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
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

            await cockpit.spawn(['rm', '-r', filepath], {
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
        queryFn: async ({ distribution }) => {
          try {
            const dsDistro = lookupDatastreamDistro(distribution);
            const result = (await cockpit.spawn(
              [
                'oscap',
                'info',
                '--profiles',
                `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
              ],
              {
                superuser: 'try',
              }
            )) as string;

            const profiles = result
              .split('\n')
              .filter((profile) => profile !== '')
              .map((profile) => profile.split(':')[0])
              .map((profile) => profile as DistributionProfileItem);

            return {
              data: profiles,
            };
          } catch (error) {
            return { error };
          }
        },
      }),
      getOscapCustomizations: builder.query<
        GetOscapCustomizationsApiResponse,
        GetOscapCustomizationsApiArg
      >({
        queryFn: async ({ distribution, profile }) => {
          try {
            const dsDistro = lookupDatastreamDistro(distribution);
            let result = (await cockpit.spawn(
              [
                'oscap',
                'xccdf',
                'generate',
                'fix',
                '--fix-type',
                'blueprint',
                '--profile',
                profile,
                `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
              ],
              {
                superuser: 'try',
              }
            )) as string;

            const parsed = TOML.parse(result);
            const blueprint = mapOnPremToHosted(parsed as BlueprintItem);

            result = (await cockpit.spawn(
              [
                'oscap',
                'info',
                '--profile',
                profile,
                `/usr/share/xml/scap/ssg/content/ssg-${dsDistro}-ds.xml`,
              ],
              {
                superuser: 'try',
              }
            )) as string;

            const descriptionLine = result
              .split('\n')
              .filter((s) => s.includes('Description: '));

            const description =
              descriptionLine.length > 0
                ? descriptionLine[0].split('Description: ')[1]
                : '';

            return {
              data: {
                ...blueprint.customizations,
                openscap: {
                  profile_id: profile,
                  // the profile name is stored in the description
                  profile_name: blueprint.description,
                  profile_description: description,
                },
              },
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
                url: '/compose',
                method: 'POST',
                body: JSON.stringify(composeReq),
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
              url: `/composes/${queryArg.composeId}`,
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
      getWorkerConfig: builder.query<WorkerConfigResponse, unknown>({
        queryFn: async () => {
          try {
            // we need to ensure that the file is created
            await cockpit.spawn(['mkdir', '-p', '/etc/osbuild-worker'], {
              superuser: 'require',
            });

            await cockpit.spawn(
              ['touch', '/etc/osbuild-worker/osbuild-worker.toml'],
              { superuser: 'require' }
            );

            const config = await cockpit
              .file('/etc/osbuild-worker/osbuild-worker.toml')
              .read();

            return { data: TOML.parse(config) };
          } catch (error) {
            return { error };
          }
        },
      }),
      updateWorkerConfig: builder.mutation<
        WorkerConfigResponse,
        UpdateWorkerConfigApiArg
      >({
        queryFn: async ({ updateWorkerConfigRequest }) => {
          try {
            const workerConfig = cockpit.file(
              '/etc/osbuild-worker/osbuild-worker.toml',
              {
                superuser: 'required',
              }
            );

            const contents = await workerConfig.modify((prev: string) => {
              if (!updateWorkerConfigRequest) {
                return prev;
              }

              const merged = {
                ...TOML.parse(prev),
                ...updateWorkerConfigRequest,
              } as WorkerConfigFile;

              const contents: WorkerConfigFile = {};
              Object.keys(merged).forEach((key: string) => {
                // this check helps prevent saving empty objects
                // into the osbuild-worker.toml config file.
                if (merged[key] !== undefined) {
                  contents[key] = Section({
                    ...merged[key],
                  });
                }
              });

              return TOML.stringify(contents, {
                newline: '\n',
                newlineAround: 'document',
              });
            });

            const systemServices = [
              'osbuild-composer.socket',
              'osbuild-worker@*.service',
              'osbuild-composer.service',
            ];

            await cockpit.spawn(
              [
                'systemctl',
                'stop',
                // we need to be explicit here and stop all the services first,
                // otherwise this step is a little bit flaky
                ...systemServices,
              ],
              {
                superuser: 'require',
              }
            );

            await cockpit.spawn(
              [
                'systemctl',
                'restart',
                // we need to restart all the services explicitly too
                // since the config doesn't always get reloaded if we
                // only reload the worker service
                ...systemServices,
              ],
              {
                superuser: 'require',
              }
            );

            return { data: TOML.parse(contents) };
          } catch (error) {
            return { error };
          }
        },
      }),
    };
  },
  // since we are inheriting some endpoints,
  // we want to make sure that we don't override
  // any existing endpoints.
  overrideExisting: 'throw',
});

export const {
  useGetArchitecturesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useDeleteBlueprintMutation,
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useComposeBlueprintMutation,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
  useGetWorkerConfigQuery,
  useUpdateWorkerConfigMutation,
} = cockpitApi;
