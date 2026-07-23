import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { v4 as uuidv4 } from 'uuid';

import { mapHostedToOnPrem } from '@/Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';
import { getHostDistro } from '@/Utilities/getHostInfo';


import {
  byCreatedAtDesc,
  getBlueprintsPath,
  imageStatusFallback,
  imageStatusFromBuildlog,
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
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { id: filename } }) => {
        const blueprintsDir = await getBlueprintsPath();
        const file = cockpit.file(
          path.join(blueprintsDir, filename, `${filename}.json`),
        );
        const contents = await file.read();
        const parsed = JSON.parse(contents);

        const blueprint = parsed as ComposerCreateBlueprintRequest;
        const composes: ComposeResponse[] = [];
        const dataDir = path.join("/var/lib/cockpit-image-builder");
        await cockpit.spawn(['mkdir', '-p', dataDir], {
          superuser: "require",
        });

        for (const ir of blueprint.image_requests) {
          if (ir.upload_request.type === 'aws.s3') {
            // this differs to crc because the on-prem backend
            // can actually understand a `local` image type.
            // We can build this locally rather than sending it
            // to an s3 bucket.
            ir.upload_request.type = 'local';
          }

          const bpOnPrem = mapHostedToOnPrem(parsed as CreateBlueprintRequest)
          const hostDistro = await getHostDistro();
          const user = await cockpit.user();
          const id = uuidv4();
          const bpPath = path.join("/tmp", `cockpit-image-builder-${id}.json`);
          await cockpit.file(bpPath).replace(JSON.stringify(bpOnPrem));
          await cockpit.spawn([
            "systemd-run",
            "--setenv",
            "HOME=" + user.home,
            "--unit",
            "cockpit-image-builder-" + id,
            "--service-type=oneshot",
            "--no-block",
            "--collect",
            "--",
            "image-builder",
            "build",
            ir.image_type,
            "--distro",
            bpOnPrem.distro || hostDistro,
            "--blueprint",
            bpPath,
            "--with-buildlog",
            "--with-manifest",
            "--with-upload-result",
            "--progress", "file",
            "--format", "json",
            "--output-dir",
            path.join(dataDir, id),
          ], {
            superuser: "require",
          });

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
      },
    ),
  }),
  getComposes: builder.query<GetComposesApiResponse, GetComposesApiArg>({
    queryFn: onPremQueryHandler(async () => {
      const blueprintsDir = await getBlueprintsPath();
      const info = await fsinfo(blueprintsDir, ['entries'], {
        superuser: 'try',
      });
      let composes: ComposesResponseItem[] = [];
      const entries = Object.entries(info.entries || {});
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
      const dataDir = path.join("/var/lib/cockpit-image-builder");

      for (const bpEntry of entries) {
        const request = await safeReadJsonFile<ComposeRequest>(
          path.join(blueprintsDir, bpEntry[0], queryArgs.composeId),
        );
        if (!request) {
          continue;
        }
        const status: GetComposeStatusApiResponse = {
          image_status: {
            status: "pending",
          },
          request,
        };

        const units = await cockpit.spawn(["systemctl", "list-units", "--output", "json", `cockpit-image-builder-${queryArgs.composeId}.service`], {
          superuser: "require",
        })
        // cockpit-image-builder units are started with `--collect`, so if it exists, it is active.
        const unitActive = JSON.parse(units as string).length > 0;
        if (unitActive) {
          status.image_status.status = "building";
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
            status.image_status = await imageStatusFallback(queryArgs.composeId);
          }
          return status;
        }

        const entries = info.entries || {};
        const buildlogEntry = Object.keys(entries).find(entry => entry.endsWith('buildlog'));
        const progressEntry = Object.keys(entries).find(entry => entry.endsWith('progress'));
        const upresEntry = Object.keys(entries).find(entry => entry.endsWith('upload-result'));

        // imageStatusFromBuildlog will return a failure status if the
        // buildlog is empty, so only call it if the unit is no longer
        // active.
        if (!unitActive) {
          if (buildlogEntry !== undefined) {
            status.image_status = await imageStatusFromBuildlog(path.join(composeDir, buildlogEntry));
            if (status.image_status.status === "failure") {
              return status;
            }
          } else {
            status.image_status.status = "failure";
            status.image_status.error = {
              id: 10,
              reason: "image-builder process is not running and no result was found",
            };
          }
        }

        if (progressEntry !== undefined) {
          const progress = await progressFromFile(path.join(composeDir, progressEntry));
          if (progress !== undefined) {
            status.image_status.progress = {
              done: progress.done,
              total: progress.total,
            };
            if (progress.subprogress) {
              status.image_status.progress.subprogress = {
                done: progress.done,
                total: progress.total,
              };
            }
          }
        }

        if (upresEntry !== undefined) {
          status.image_status.upload_status = await uploadStatusFromFile(path.join(composeDir, upresEntry));
        }
        return status;
      }
      throw new Error('Compose not found');
    }),
  }),
});
