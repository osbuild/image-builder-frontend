import path from 'path';

import cockpit from 'cockpit';
import { fsinfo } from 'cockpit/fsinfo';
import { v4 as uuidv4 } from 'uuid';

import { mapHostedToOnPrem } from '@/Components/Blueprints/helpers/onPremToHostedBlueprintMapper';
import { IMAGE_MODE } from '@/constants';
import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { getBlueprintsPath } from './helpers';

import {
  BlueprintItem,
  CreateBlueprintApiResponse,
  CreateBlueprintRequest,
  DeleteBlueprintApiArg,
  DeleteBlueprintApiResponse,
  ExportBlueprintApiArg,
  GetBlueprintApiArg,
  GetBlueprintApiResponse,
  GetBlueprintsApiArg,
  GetBlueprintsApiResponse,
  UpdateBlueprintApiResponse,
} from '../../hosted';
import {
  type ComposerBlueprint as Blueprint,
  ComposerCreateBlueprintApiArg,
  ComposerCreateBlueprintRequest,
  ComposerUpdateBlueprintApiArg,
} from '../types';

export const blueprintEndpoints = (builder: OnPremBuilder) => ({
  getBlueprint: builder.query<GetBlueprintApiResponse, GetBlueprintApiArg>({
    queryFn: onPremQueryHandler(async ({ queryArgs: { id, version } }) => {
      const blueprintsDir = await getBlueprintsPath();
      const bpPath = path.join(blueprintsDir, id, `${id}.json`);
      const bpInfo = await fsinfo(bpPath, ['mtime'], {
        superuser: 'try',
      });
      const contents = await cockpit.file(bpPath).read();
      const parsed = JSON.parse(contents);
      return {
        ...parsed,
        id,
        version: version,
        last_modified_at: new Date(bpInfo!.mtime * 1000).toString(),
        // linting is not supported on prem
        lint: {
          errors: [],
        },
      };
    }),
  }),
  getBlueprints: builder.query<GetBlueprintsApiResponse, GetBlueprintsApiArg>({
    queryFn: onPremQueryHandler(async ({ queryArgs }) => {
      const { name, search, offset, limit } = queryArgs;

      const blueprintsDir = await getBlueprintsPath();

      // we probably don't need any more information other
      // than the entries from the directory
      const info = await fsinfo(blueprintsDir, ['entries'], {
        superuser: 'try',
      });

      const entries = Object.entries(info.entries || {});
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
        meta: { count: blueprints.length },
        links: {
          // These are kind of meaningless for the on-prem
          // version
          first: first,
          last: last,
        },
        data: paginatedBlueprints,
      };
    }),
  }),
  createBlueprint: builder.mutation<
    CreateBlueprintApiResponse,
    ComposerCreateBlueprintApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { createBlueprintRequest: blueprintReq } }) => {
        const id = uuidv4();
        const blueprintsDir = await getBlueprintsPath();
        await cockpit.spawn(['mkdir', '-p', path.join(blueprintsDir, id)], {});
        await cockpit.file(path.join(blueprintsDir, id, `${id}.json`)).replace(
          JSON.stringify({
            ...blueprintReq,
            // we need to strip the dummy distribution
            // before saving the blueprint to preserve
            // blueprint interoperability
            distribution:
              blueprintReq.distribution !== IMAGE_MODE
                ? blueprintReq.distribution
                : undefined,
          }),
        );
        return {
          id,
        };
      },
    ),
  }),
  updateBlueprint: builder.mutation<
    UpdateBlueprintApiResponse,
    ComposerUpdateBlueprintApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { id, createBlueprintRequest: blueprintReq } }) => {
        const blueprintsDir = await getBlueprintsPath();
        await cockpit.file(path.join(blueprintsDir, id, `${id}.json`)).replace(
          JSON.stringify({
            ...blueprintReq,
            // we need to strip the dummy distribution
            // before saving the blueprint to preserve
            // blueprint interoperability
            distribution:
              blueprintReq.distribution !== IMAGE_MODE
                ? blueprintReq.distribution
                : undefined,
          }),
        );
        return {
          id,
        };
      },
    ),
  }),
  deleteBlueprint: builder.mutation<
    DeleteBlueprintApiResponse,
    DeleteBlueprintApiArg
  >({
    queryFn: onPremQueryHandler(async ({ queryArgs: { id: filename } }) => {
      const blueprintsDir = await getBlueprintsPath();
      const filepath = path.join(blueprintsDir, filename);

      await cockpit.spawn(['rm', '-r', filepath], {
        superuser: 'try',
      });

      return {};
    }),
  }),
  exportBlueprintCockpit: builder.query<Blueprint, ExportBlueprintApiArg>({
    queryFn: onPremQueryHandler(async ({ queryArgs: { id } }) => {
      const blueprintsDir = await getBlueprintsPath();
      const file = cockpit.file(path.join(blueprintsDir, id, `${id}.json`));
      const contents = await file.read();
      const blueprint = JSON.parse(contents) as ComposerCreateBlueprintRequest;

      return mapHostedToOnPrem(blueprint as CreateBlueprintRequest);
    }),
  }),
});
