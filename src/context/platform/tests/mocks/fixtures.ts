import type { PlatformHooks } from '@/context/platform/types';

/**
 * Creates a Proxy that throws a descriptive error when an unmocked hook is
 * accessed. Tests must spread `mockPlatform` and override the specific hooks
 * they need — any hook that isn't overridden will throw immediately with a
 * clear message instead of the opaque "undefined is not a function".
 */
const throwOnAccess = <T extends string>(section: T): Record<string, never> =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        throw new Error(
          `mockPlatform.${section}.${String(prop)} is not mocked. ` +
            `Override it in your test via { ...mockPlatform, ${section}: { ${String(prop)}: vi.fn() } }.`,
        );
      },
    },
  ) as Record<string, never>;

export const mockPlatform = {
  queries: throwOnAccess('queries'),
  mutations: throwOnAccess('mutations'),
  env: {
    useFlag: () => false,
    useGetEnvironment: () => ({ isBeta: () => false, isProd: () => true }),
  },
  api: throwOnAccess('api'),
} as unknown as PlatformHooks;
