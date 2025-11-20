import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import TOML from 'smol-toml';
import { v4 as uuidv4 } from 'uuid';

import type {
  Blueprint as CloudApiBlueprint,
  Customizations,
} from './composerCloudApi';
// We have to work around RTK query here, since it doesn't like splitting
// out the same api into two separate apis. So, instead, we can just
// inherit/import the `contentSourcesApi` and build on top of that.
// This is fine since all the api endpoints for on-prem should query
// the same unix socket. This allows us to split out the code a little
// bit so that the `cockpitApi` doesn't become a monolith.
import { contentSourcesApi } from './contentSourcesApi';
import type {
  CockpitCreateBlueprintApiArg,
  CockpitCreateBlueprintRequest,
  CockpitImageRequest,
  CockpitUpdateBlueprintApiArg,
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
  CreateBlueprintApiResponse,
  CreateBlueprintRequest,
  DeleteBlueprintApiArg,
  DeleteBlueprintApiResponse,
  DistributionProfileItem,
  ExportBlueprintApiArg,
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
  OpenScapProfile,
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

// Gets the user's $XDG_STATE_HOME directory to save blueprints in. Uses $HOME/.local/state as a fallback.
const getBlueprintsPath = async () => {
  let stateDir = (await cockpit.script('echo -n $XDG_STATE_HOME')) as string;
  const user = await cockpit.user();
  if (stateDir === '') {
    stateDir = `${user.home}/.local/state`;
  }
  const blueprintsDir = path.join(stateDir, BLUEPRINTS_DIR);

  // Backwards compatibility, drop after rhel 10.2.
  await cockpit.script(`
if [ ! -e "${blueprintsDir}" ] && [ -d "${user.home}/.cache/cockpit-image-builder" ] ; then
  cp -a "${user.home}/.cache/cockpit-image-builder" ${blueprintsDir}
fi
`);

  // make sure the directory exists
  await cockpit.spawn(['mkdir', '-p', blueprintsDir], {});
  return blueprintsDir;
};

const readComposes = async (bpID: string) => {
  const blueprintsDir = await getBlueprintsPath();
  let composes: ComposesResponseItem[] = [];
  const bpInfo = await fsinfo(
    path.join(blueprintsDir, bpID),
    ['entries', 'mtime'],
    {
      superuser: 'try',
    },
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
      '/etc/osbuild-worker/osbuild-worker.toml',
    );
    const contents = await worker_config.read();
    const parsed = TOML.parse(contents);
    return Object.keys(parsed).filter((k) => k === 'aws');
  } catch {
    return [];
  }
};

export const toCloudAPIComposeRequest = (
  blueprint: CockpitCreateBlueprintRequest,
  distribution: string,
  image_requests: CockpitImageRequest[],
) => {
  // subscription, users & openscap are the only options
  // that aren't compatibile with the on-prem customizations,
  // so we have to handle those separately
  const { subscription, openscap, users, ...hostedCustomizations } =
    blueprint.customizations;

  const customizations: Customizations = {
    ...hostedCustomizations,
  };

  if (openscap) {
    customizations.openscap = {
      // the casting here is fine since compliance isn't available on-prem
      profile_id: (openscap as OpenScapProfile).profile_id,
    };
  }

  if (users) {
    customizations.users = users.map((user) => {
      const { ssh_key, ...options } = user;
      return {
        ...options,
        ...(ssh_key && { key: ssh_key }),
      };
    });
  }

  if (subscription) {
    customizations!.subscription = {
      organization: subscription.organization.toString(),
      activation_key: subscription['activation-key'],
      server_url: subscription['server-url'],
      base_url: subscription['base-url'],
      rhc: subscription.rhc,
      insights: subscription.insights,
      insights_client_proxy: subscription.insights_client_proxy,
    };
  }

  return {
    distribution,
    customizations,
    image_requests: image_requests.map((ir) => ({
      architecture: ir.architecture,
      image_type: ir.image_type,
      repositories: [],
      upload_targets: [
        {
          type: ir.upload_request.type,
          upload_options: ir.upload_request.options,
        },
      ],
    })),
  };
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
                  path.join(blueprintsDir, filename, `${filename}.json`),
                );
                const contents = await file.read();
                const parsed = JSON.parse(contents);
                return {
                  ...parsed,
                  id: filename as string,
                  version: 1,
                  last_modified_at: Date.now().toString(),
                };
              }),
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
        CockpitCreateBlueprintApiArg
      >({
        queryFn: async ({ createBlueprintRequest: blueprintReq }) => {
          try {
            const id = uuidv4();
            const blueprintsDir = await getBlueprintsPath();
            await cockpit.spawn(
              ['mkdir', '-p', path.join(blueprintsDir, id)],
              {},
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
        CockpitUpdateBlueprintApiArg
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
      exportBlueprintCockpit: builder.query<
        CloudApiBlueprint,
        ExportBlueprintApiArg
      >({
        queryFn: async ({ id }) => {
          const blueprintsDir = await getBlueprintsPath();
          const file = cockpit.file(path.join(blueprintsDir, id, `${id}.json`));
          const contents = await file.read();
          const blueprint = JSON.parse(
            contents,
          ) as CockpitCreateBlueprintRequest;
          const onPrem = mapHostedToOnPrem(blueprint as CreateBlueprintRequest);
          return {
            data: onPrem,
          };
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
              },
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
              },
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
              },
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
              path.join(blueprintsDir, filename, `${filename}.json`),
            );
            const contents = await file.read();
            const parsed = JSON.parse(contents);

            const blueprint = parsed as CockpitCreateBlueprintRequest;
            const composes: ComposeResponse[] = [];
            for (const ir of blueprint.image_requests) {
              if (ir.upload_request.type === 'aws.s3') {
                // this differs to crc because the on-prem backend
                // can actually understand a `local` image type.
                // We can build this locally rather than sending it
                // to an s3 bucket.
                ir.upload_request.type = 'local';
              }

              // this request gets saved to the local storage and needs to
              // match the hosted format
              const crcComposeRequest = {
                ...blueprint,
                image_requests: [ir],
              };

              const composeResp = await baseQuery({
                url: '/compose',
                method: 'POST',
                body: JSON.stringify(
                  // since this is the request that gets sent to the cloudapi
                  // backend, we need to modify it slightly
                  toCloudAPIComposeRequest(
                    blueprint,
                    crcComposeRequest.distribution,
                    [ir],
                  ),
                ),
                headers: {
                  'content-type': 'application/json',
                },
              });

              await cockpit
                .file(path.join(blueprintsDir, filename, composeResp.data?.id))
                .replace(JSON.stringify(crcComposeRequest));
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
              { superuser: 'require' },
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
              },
            );

            const contents = await workerConfig.modify((prev: string) => {
              if (!updateWorkerConfigRequest) {
                return prev;
              }
              const merged = {
                ...TOML.parse(prev),
                ...updateWorkerConfigRequest,
              } as WorkerConfigFile;

              return TOML.stringify(merged);
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
              },
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
              },
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
  useExportBlueprintCockpitQuery,
  useLazyExportBlueprintCockpitQuery,
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
