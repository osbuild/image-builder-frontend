import cockpit from 'cockpit';
import TOML from 'smol-toml';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import {
  UpdateWorkerConfigApiArg,
  WorkerConfigFile,
  WorkerConfigResponse,
} from '../types';

export const workerEndpoints = (builder: OnPremBuilder) => ({
  getWorkerConfig: builder.query<WorkerConfigResponse, void>({
    queryFn: onPremQueryHandler(async () => {
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

      return TOML.parse(config);
    }),
  }),
  updateWorkerConfig: builder.mutation<
    WorkerConfigResponse,
    UpdateWorkerConfigApiArg
  >({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { updateWorkerConfigRequest } }) => {
        const workerConfig = cockpit.file(
          '/etc/osbuild-worker/osbuild-worker.toml',
          {
            superuser: 'require',
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

        return TOML.parse(contents);
      },
    ),
  }),
});
