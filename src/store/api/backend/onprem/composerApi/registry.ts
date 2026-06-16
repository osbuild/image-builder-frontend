import cockpit from 'cockpit';

import { OnPremBuilder, onPremQueryHandler } from '@/store/api/shared';

import type { RegistryAuthStatus, RegistryLoginApiArg } from '../types';

export const registryEndpoints = (builder: OnPremBuilder) => ({
  getRegistryAuthStatus: builder.query<RegistryAuthStatus, void>({
    queryFn: onPremQueryHandler(async () => {
      let username: string;
      try {
        const result = await cockpit.spawn(
          ['podman', 'login', '--get-login', 'registry.redhat.io'],
          { superuser: 'require' },
        );
        username = (result as string).trim();
      } catch {
        return { status: 'not-logged-in' };
      }

      try {
        await cockpit.spawn(
          ['podman', 'search', 'registry.redhat.io/rhel10', '--limit', '1'],
          { superuser: 'require' },
        );
      } catch {
        return { status: 'auth-failed', username };
      }

      return { status: 'authenticated', username };
    }),
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
