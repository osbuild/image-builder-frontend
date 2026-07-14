import cockpit from 'cockpit';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import { checkRegistryAuth } from './helpers';

import type { RegistryAuthStatus, RegistryLoginApiArg } from '../types';

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
});
