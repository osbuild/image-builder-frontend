import cockpit from 'cockpit';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { checkImageExists, checkRegistryAuth } from './helpers';

import type {
  PullImageApiArg,
  RegistryAuthStatus,
  RegistryLoginApiArg,
} from '../types';

export const registryEndpoints = (builder: OnPremBuilder) => ({
  getRegistryAuthStatus: builder.query<RegistryAuthStatus, void>({
    queryFn: onPremQueryHandler(() => checkRegistryAuth()),
  }),
  registryLogin: builder.mutation<RegistryAuthStatus, RegistryLoginApiArg>({
    queryFn: onPremQueryHandler(
      async ({ queryArgs: { username, password } }) => {
        await cockpit
          .spawn(
            [
              'podman',
              'login',
              '--username',
              username,
              '--password-stdin',
              'registry.redhat.io',
            ],
            { superuser: 'require', err: 'message' },
          )
          .input(password);
        return { status: 'authenticated', username };
      },
    ),
  }),
  registryLogout: builder.mutation<void, void>({
    queryFn: onPremQueryHandler(async () => {
      await cockpit.spawn(['podman', 'logout', 'registry.redhat.io'], {
        superuser: 'require',
      });
    }),
  }),
  getImageExists: builder.query<boolean, PullImageApiArg>({
    queryFn: onPremQueryHandler(async ({ queryArgs: { reference } }) =>
      checkImageExists(reference),
    ),
  }),
  pullImage: builder.mutation<void, PullImageApiArg>({
    queryFn: onPremQueryHandler(async ({ queryArgs: { reference } }) => {
      await cockpit.spawn(['podman', 'pull', reference], {
        superuser: 'require',
        err: 'message',
      });
    }),
  }),
});
