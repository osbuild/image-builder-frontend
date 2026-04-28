import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  getBlueprintsPath,
  readComposes,
  safeReadJsonFile,
  toComposerComposeRequest,
} from './helpers';

import {
  ComposeBlueprintApiArg,
  ComposeBlueprintApiResponse,
  ComposeRequest,
  ComposeResponse,
  ComposesResponseItem,
  GetBlueprintComposesApiArg,
  GetBlueprintComposesApiResponse,
  GetComposesApiArg,
  GetComposesApiResponse,
  GetComposeStatusApiArg,
  GetComposeStatusApiResponse,
} from '../../hosted';
import { assertComposeResponse, assertComposeStatus } from '../typeguards';
import { type ComposerCreateBlueprintRequest } from '../types';

export const composeEndpoints = (builder: OnPremBuilder) => ({
  composeBlueprint: builder.mutation<
    ComposeBlueprintApiResponse,
    ComposeBlueprintApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { id: filename }, baseQuery }) => {
        const blueprintsDir = await getBlueprintsPath();
        const file = cockpit.file(
          path.join(blueprintsDir, filename, `${filename}.json`),
        );
        const contents = await file.read();
        const parsed = JSON.parse(contents);

        const blueprint = parsed as ComposerCreateBlueprintRequest;
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

          const result = await baseQuery({
            url: '/compose',
            method: 'POST',
            body: JSON.stringify(
              // since this is the request that gets sent to the cloudapi
              // backend, we need to modify it slightly
              toComposerComposeRequest(
                blueprint,
                crcComposeRequest.distribution,
                [ir],
              ),
            ),
            headers: {
              'content-type': 'application/json',
            },
          });

          if (result.error) {
            throw result.error;
          }

          const { id } = assertComposeResponse(result.data);
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
    queryFn: onPremQueryHandler(async ({ queryArgs, baseQuery }) => {
      const result = await baseQuery({
        url: `/composes/${queryArgs.composeId}`,
        method: 'GET',
      });

      if (result.error) {
        throw result.error;
      }

      const data = assertComposeStatus(result.data);
      const blueprintsDir = await getBlueprintsPath();
      const info = await fsinfo(blueprintsDir, ['entries'], {
        superuser: 'try',
      });

      const entries = Object.entries(info.entries || {});
      for (const bpEntry of entries) {
        const request = await safeReadJsonFile<ComposeRequest>(
          path.join(blueprintsDir, bpEntry[0], queryArgs.composeId),
        );
        if (!request) {
          continue;
        }
        return {
          image_status: data.image_status,
          request,
        };
      }

      throw new Error('Compose not found');
    }),
  }),
});
