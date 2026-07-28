import path from 'path';

import cockpit from 'cockpit';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { getBlueprintsPath, safeReadJsonFile } from './helpers';

import {
  UpdateUploadConfigApiArg,
  UploadConfigFile,
  UploadConfigResponse,
} from '../types';

export const uploadEndpoints = (builder: OnPremBuilder) => ({
  getUploadConfig: builder.query<UploadConfigResponse, void>({
    queryFn: onPremQueryHandler(async () => {
      const stateDir = await getBlueprintsPath();
      const uploadConfig = await safeReadJsonFile<UploadConfigFile>(
        path.join(stateDir, 'upload-config.json'),
      );
      const result: UploadConfigResponse = {};
      if (uploadConfig === null) {
        return result;
      }
      if (uploadConfig.aws !== undefined) {
        result.aws = uploadConfig.aws;
      }
      return result;
    }),
  }),
  updateUploadConfig: builder.mutation<
    UploadConfigResponse,
    UpdateUploadConfigApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { updateUploadConfigRequest } }) => {
        const stateDir = await getBlueprintsPath();
        const uploadConfig = cockpit.file(
          path.join(stateDir, 'upload-config.json'),
          {
            superuser: 'require',
          },
        );

        const contents = await uploadConfig.modify((prev: string) => {
          if (!updateUploadConfigRequest) {
            return prev;
          }
          const merged = {
            ...JSON.parse(prev),
            ...updateUploadConfigRequest,
          } as UploadConfigFile;

          return JSON.stringify(merged);
        });
        return JSON.parse(contents);
      },
    ),
  }),
});
