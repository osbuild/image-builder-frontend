import path from 'path';

// Note: for the on-prem version of the frontend we have configured
// this so that we check `node_modules` and `pkg/lib` for packages.
// To get around this for the hosted service, we have configured
// the `tsconfig` to stubs of the `cockpit` and `cockpit/fsinfo`
// modules. These stubs are in the `src/test/mocks/cockpit` directory.
// We also needed to create an alias in vitest to make this work.
import TOML from '@ltd/j-toml';
import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { LongRunningProcess } from 'long-running-process';
import { v4 as uuidv4 } from 'uuid';

// We have to work around RTK query here, since it doesn't like splitting
// out the same api into two separate apis. So, instead, we can just
// inherit/import the `contentSourcesApi` and build on top of that.
// This is fine since all the api endpoints for on-prem should query
// the same unix socket. This allows us to split out the code a little
// bit so that the `cockpitApi` doesn't become a monolith.
import { contentSourcesApi } from './contentSourcesApi';
import {
  composeStatus,
  ComposeStatus,
  datastreamDistroLookup,
  getBlueprintsPath,
  imageTypeLookup,
  paginate,
  readComposes,
  updateComposeStatus,
} from './helpers';
import type {
  CockpitAwsUploadRequestOptions,
  CockpitCreateBlueprintApiArg,
  CockpitCreateBlueprintRequest,
  CockpitUpdateBlueprintApiArg,
  GetCockpitComposeStatusApiResponse,
  ImageStatus,
  ImageType,
} from './types';

import {
  mapHostedToOnPrem,
  mapOnPremToHosted,
} from '../../Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import {
  ARTIFACTS_DIR,
  ON_PREM_DISTRO_MAP,
  ON_PREM_SUPPORTED_IMAGE_TYPES,
} from '../../constants';
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
  GetOscapCustomizationsApiArg,
  GetOscapCustomizationsApiResponse,
  GetOscapProfilesApiArg,
  GetOscapProfilesApiResponse,
  UpdateBlueprintApiResponse,
} from '../service/imageBuilderApi';

export const cockpitApi = contentSourcesApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      getArchitectures: builder.query<
        GetArchitecturesApiResponse,
        GetArchitecturesApiArg
      >({
        queryFn: async ({ distribution }) => {
          try {
            const res = await cockpit.spawn(
              [
                'image-builder',
                'list',
                '--format',
                'json',
                '--filter',
                `distro:${ON_PREM_DISTRO_MAP.get(distribution)}`,
              ],
              {},
            );

            const output = res || '[]';
            const items = JSON.parse(output as string) as ImageType[];
            const map: Record<string, Set<string>> = {};

            for (const item of items) {
              const arch = item.arch.name;
              const imageType = imageTypeLookup(item.image_type.name);

              if (!map[arch]) {
                map[arch] = new Set();
              }

              if (ON_PREM_SUPPORTED_IMAGE_TYPES.includes(imageType)) {
                map[arch].add(imageType);
              }
            }

            return {
              data: Object.entries(map).map(([arch, types]) => ({
                arch,
                image_types: Array.from(types).sort(),
                repositories: [],
              })),
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

            return paginate(blueprints, offset, limit);
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
              .replace(JSON.stringify(blueprintReq, null, 2));
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
              .replace(JSON.stringify(blueprintReq, null, 2));
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
            const dsDistro = datastreamDistroLookup(distribution);
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
            const dsDistro = datastreamDistroLookup(distribution);
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
        queryFn: async ({ id: filename }) => {
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

              const uuid = uuidv4();
              const composeDir = path.join(blueprintsDir, filename, uuid);

              await cockpit.spawn(['mkdir', '-p', composeDir], {});
              const ibBpPath = path.join(composeDir, 'bp.json');
              await cockpit
                .file(ibBpPath)
                .replace(
                  JSON.stringify(
                    mapHostedToOnPrem(blueprint as CreateBlueprintRequest),
                    null,
                    2,
                  ),
                );

              // save the blueprint request early, since any errors
              // in this function cause pretty big headaches with
              // the images table
              await cockpit
                .file(path.join(composeDir, 'request.json'))
                .replace(JSON.stringify(crcComposeRequest, null, 2));

              let awsArgs: string[] = [];
              if (ir.upload_request.type === 'aws') {
                const options = ir.upload_request
                  .options as CockpitAwsUploadRequestOptions;

                if (!options.region) {
                  throw new Error('No region option for AWS upload type');
                }

                if (!options.bucket) {
                  throw new Error('No bucket option for AWS upload type');
                }

                awsArgs = [
                  '--aws-region',
                  options.region,
                  '--aws-bucket',
                  options.bucket,
                  '--aws-ami-name',
                  `cockpit-image-builder-${uuid}`,
                ];
              }

              const user = await cockpit.user();
              const cmd = [
                // the image build fails if we don't set
                // this for some reason
                `HOME=${user.home}`,
                '/usr/bin/image-builder',
                'build',
                '--with-buildlog',
                '--blueprint',
                ibBpPath,
                '--output-dir',
                path.join(ARTIFACTS_DIR, uuid),
                '--output-name',
                uuid,
                ...awsArgs,
                '--distro',
                crcComposeRequest.distribution,
                ir.image_type,
              ];

              const process = new LongRunningProcess(
                `cockpit-image-builder-${uuid}.service`,
                updateComposeStatus(composeDir),
              );

              // this is a workaround because the process
              // can't be started when in `init` state
              process.state = 'stopped';

              process.run(['bash', '-ec', cmd.join(' ')]).catch(async () => {
                await cockpit
                  .file(path.join(composeDir, 'result'))
                  .replace(ComposeStatus.FAILURE);
              });

              composes.push({ id: uuid });
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

            return paginate(composes);
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
            return paginate(composes);
          } catch (error) {
            return { error };
          }
        },
      }),
      getComposeStatus: builder.query<
        GetCockpitComposeStatusApiResponse,
        GetComposeStatusApiArg
      >({
        queryFn: async (queryArg) => {
          try {
            const blueprintsDir = await getBlueprintsPath();
            const info = await fsinfo(blueprintsDir, ['entries'], {
              superuser: 'try',
            });
            const entries = Object.entries(info?.entries || {});
            for await (const bpEntry of entries) {
              const bpComposes = await readComposes(bpEntry[0]);
              if (!bpComposes.some((c) => c.id === queryArg.composeId)) {
                continue;
              }

              const request = await cockpit
                .file(
                  path.join(
                    blueprintsDir,
                    bpEntry[0],
                    queryArg.composeId,
                    'request.json',
                  ),
                )
                .read();

              const status = await composeStatus(
                queryArg.composeId,
                path.join(blueprintsDir, bpEntry[0], queryArg.composeId),
              );

              return {
                data: {
                  image_status: status as ImageStatus,
                  request: JSON.parse(request),
                },
              };
            }

            throw new Error('Compose not found');
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
} = cockpitApi;
