import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  byCreatedAtDesc,
  getBlueprintsPath,
  getRegistrationArgs,
  getUploadArgs,
  imageStatusFallback,
  imageStatusFromBuildlog,
  mapHostedToOnPrem,
  progressFromFile,
  readComposes,
  safeReadJsonFile,
  uploadStatusFromFile,
} from './helpers';

import {
  ComposeBlueprintApiArg,
  ComposeBlueprintApiResponse,
  ComposeRequest,
  ComposeResponse,
  ComposesResponseItem,
  CreateBlueprintRequest,
  GetBlueprintComposesApiArg,
  GetBlueprintComposesApiResponse,
  GetComposesApiArg,
  GetComposesApiResponse,
  GetComposeStatusApiArg,
  GetComposeStatusApiResponse,
} from '../../hosted';
import { type ComposerCreateBlueprintRequest } from '../types';

export const composeEndpoints = (builder: OnPremBuilder) => ({
  composeBlueprint: builder.mutation<
    ComposeBlueprintApiResponse,
    ComposeBlueprintApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs: { id: filename } }) => {
      const blueprintsDir = await getBlueprintsPath();
      const file = cockpit.file(
        path.join(blueprintsDir, filename, `${filename}.json`),
      );
      const contents = await file.read();
      const parsed = JSON.parse(contents);

      const blueprint = parsed as ComposerCreateBlueprintRequest;
      const composes: ComposeResponse[] = [];
      const dataDir = path.join('/var/lib/cockpit-image-builder');
      await cockpit.spawn(['mkdir', '-p', dataDir], {
        superuser: 'require',
      });

      for (const ir of blueprint.image_requests) {
        if (ir.upload_request.type === 'aws.s3') {
          // this differs to crc because the on-prem backend
          // can actually understand a `local` image type.
          // We can build this locally rather than sending it
          // to an s3 bucket.
          ir.upload_request.type = 'local';
        }

        const bpOnPrem = mapHostedToOnPrem(parsed as CreateBlueprintRequest);
        const user = await cockpit.user();
        const id = crypto.randomUUID();
        const { runArgs, ibArgs } = await getUploadArgs(
          ir.upload_request.type,
          id,
        );
        const bpPath = path.join(
          '/var/cache/cockpit-image-builder',
          `cockpit-image-builder-${id}.json`,
        );
        await cockpit
          .file(bpPath, { superuser: 'require' })
          .replace(JSON.stringify(bpOnPrem));

        const registrationArgs = await getRegistrationArgs(
          blueprint.customizations.subscription,
          id,
        );

        // The distro is intentionally not passed: image-builder falls back to
        // the host distro, including the minor version for distros that have
        // one (e.g. rhel-10.3). Generic aliases like `rhel-10` are not
        // supported by the CLI.
        await cockpit.spawn(
          [
            'systemd-run',
            '--setenv',
            'HOME=' + user.home,
            ...runArgs,
            '--unit',
            'cockpit-image-builder-' + id,
            '--service-type=oneshot',
            '--no-block',
            '--collect',
            '--',
            'image-builder',
            'build',
            ir.image_type,
            '--blueprint',
            bpPath,
            '--with-buildlog',
            '--with-manifest',
            '--with-upload-result',
            '--progress',
            'file',
            '--format',
            'json',
            '--output-dir',
            path.join(dataDir, id),
            ...registrationArgs,
            ...ibArgs,
          ],
          {
            superuser: 'require',
          },
        );

        const crcComposeRequest = {
          ...blueprint,
          image_requests: [ir],
        };
        await cockpit
          .file(path.join(blueprintsDir, filename, id))
          .replace(JSON.stringify(crcComposeRequest));
        composes.push({ id });
      }
      return composes;
    }),
  }),
  getComposes: builder.query<GetComposesApiResponse, GetComposesApiArg>({
    queryFn: onPremQueryHandler(async () => {
      const blueprintsDir = await getBlueprintsPath();
      const info = await fsinfo(blueprintsDir, ['entries', 'type'], {
        superuser: 'try',
      });
      let composes: ComposesResponseItem[] = [];
      // Filter to ensure the upload-config.json file is not counted as a blueprint.
      const entries = Object.entries(info.entries || {}).filter(
        (entry) => entry[1].type === 'dir',
      );
      for (const entry of entries) {
        composes = composes.concat(await readComposes(entry[0]));
      }
      composes.sort(byCreatedAtDesc);
      return {
        meta: {
          count: composes.length,
        },
        links: {
          first: composes.length > 0 ? composes[0].id : '',
          last: composes.length > 0 ? composes[composes.length - 1].id : '',
        },
        data: composes,
      };
    }),
  }),
  getBlueprintComposes: builder.query<
    GetBlueprintComposesApiResponse,
    GetBlueprintComposesApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs }) => {
      const composes = await readComposes(queryArgs.id);
      return {
        meta: {
          count: composes.length,
        },
        links: {
          first: composes.length > 0 ? composes[0].id : '',
          last: composes.length > 0 ? composes[composes.length - 1].id : '',
        },
        data: composes,
      };
    }),
  }),
  getComposeStatus: builder.query<
    GetComposeStatusApiResponse,
    GetComposeStatusApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs }) => {
      const blueprintsDir = await getBlueprintsPath();
      const bpinfo = await fsinfo(blueprintsDir, ['entries'], {
        superuser: 'try',
      });
      const entries = Object.entries(bpinfo.entries || {});
      const dataDir = path.join('/var/lib/cockpit-image-builder');

      for (const bpEntry of entries) {
        const request = await safeReadJsonFile<ComposeRequest>(
          path.join(blueprintsDir, bpEntry[0], queryArgs.composeId),
        );
        if (!request) {
          continue;
        }
        const status: GetComposeStatusApiResponse = {
          image_status: {
            status: 'pending',
          },
          request,
        };

        const units = await cockpit.spawn(
          [
            'systemctl',
            'list-units',
            '--output',
            'json',
            `cockpit-image-builder-${queryArgs.composeId}.service`,
          ],
          {
            superuser: 'require',
          },
        );
        // cockpit-image-builder units are started with `--collect`, so if it exists, it is active.
        const unitActive = JSON.parse(units as string).length > 0;
        if (unitActive) {
          status.image_status.status = 'building';
        }

        const composeDir = path.join(dataDir, queryArgs.composeId);
        let info;
        try {
          info = await fsinfo(composeDir, ['entries'], {
            superuser: 'try',
          });
        } catch {
          // Checks if the compose was created using osbuild-composer if the unit does not exist,
          // otherwise the unit is active but hasn't created the output directory yet.
          if (!unitActive) {
            status.image_status = await imageStatusFallback(
              queryArgs.composeId,
            );
          }
          return status;
        }

        const entries = info.entries || {};
        const buildlogEntry = Object.keys(entries).find((entry) =>
          entry.endsWith('buildlog'),
        );
        const progressEntry = Object.keys(entries).find((entry) =>
          entry.endsWith('progress'),
        );
        const upresEntry = Object.keys(entries).find((entry) =>
          entry.endsWith('upload-result'),
        );

        // imageStatusFromBuildlog will return a failure status if the
        // buildlog is empty, so only call it if the unit is no longer
        // active.
        if (!unitActive) {
          if (buildlogEntry !== undefined) {
            status.image_status = await imageStatusFromBuildlog(
              path.join(composeDir, buildlogEntry),
            );
            if (status.image_status.status === 'failure') {
              return status;
            }
          } else {
            status.image_status.status = 'failure';
            status.image_status.error = {
              id: 10,
              reason:
                'image-builder process is not running and no result was found',
            };
            // Return before the upload result check overwrites this error
            // with the less specific "no upload result found" one.
            return status;
          }
        }

        if (progressEntry !== undefined) {
          const progress = await progressFromFile(
            path.join(composeDir, progressEntry),
          );
          if (progress !== undefined) {
            status.image_status.progress = {
              done: progress.done,
              total: progress.total,
            };
            if (progress.subprogress) {
              status.image_status.progress.subprogress = {
                done: progress.subprogress.done,
                total: progress.subprogress.total,
              };
            }
          }
        }

        if (upresEntry !== undefined) {
          status.image_status.upload_status = await uploadStatusFromFile(
            path.join(composeDir, upresEntry),
          );
          // mark entire build as failed
          if (
            status.image_status.status === 'success' &&
            status.image_status.upload_status.status === 'failure'
          ) {
            status.image_status.status = 'failure';
            status.image_status.error = {
              id: 28,
              reason: 'image build succeeded but upload failed',
            };
          }
        } else if (!unitActive) {
          status.image_status.status = 'failure';
          status.image_status.error = {
            id: 28,
            reason:
              'image-builder process is not running and no upload result found',
          };
        }

        return status;
      }
      throw new Error('Compose not found');
    }),
  }),
});
