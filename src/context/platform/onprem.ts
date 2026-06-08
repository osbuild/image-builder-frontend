import {
  useComposeBlueprintMutation,
  useCreateBlueprintMutation,
  useDeleteBlueprintMutation,
  useGetArchitecturesQuery,
  useGetBlueprintComposesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useGetDistributionsQuery,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useLazyGetBlueprintsQuery,
  useLazyGetOscapCustomizationsQuery,
  useUpdateBlueprintMutation,
} from '@/store/api/backend/onprem/composerApi';
import { composerApi } from '@/store/api/backend/onprem/enhancedComposerApi';
import {
  contentSourcesApi,
  useListSnapshotsByDateMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources/onprem';

import type { PlatformHooks } from './types';

// Feature flag defaults for on-premises — Unleash is not available.
// All flags default to false (default-deny). Add cases to the switch
// when a flag-gated feature needs to be enabled for on-prem users.
// NOTE: useGetEnvironment.ts has a parallel copy; both will be unified
// when we migrate useFlag to usePlatform().env.
export const onPremFlag = (flag: string): boolean => {
  switch (flag) {
    // case '<flag-name>':
    //   return true;
    default:
      return false;
  }
};

// On-prem environment is static — hoist to avoid allocations per call
const onPremEnv = { isBeta: () => false, isProd: () => true };

// satisfies checks that every key in PlatformHooks['queries'] is present.
// The cast handles the RTK UseQuery<D> invariance mismatch — the runtime
// behavior is identical across platforms.
const onPremQueries = {
  useGetArchitecturesQuery,
  useGetDistributionsQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
} satisfies Record<keyof PlatformHooks['queries'], unknown>;

const onPremMutations = {
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useDeleteBlueprintMutation,
  useComposeBlueprintMutation,
  useSearchRpmMutation,
  useListSnapshotsByDateMutation,
} satisfies Record<keyof PlatformHooks['mutations'], unknown>;

const onPremApi = {
  backendApi: composerApi,
  contentSourcesApi,
  useBackendPrefetch: composerApi.usePrefetch,
} satisfies Record<keyof PlatformHooks['api'], unknown>;

export const onPremPlatform: PlatformHooks = {
  queries: onPremQueries as unknown as PlatformHooks['queries'],
  mutations: onPremMutations as unknown as PlatformHooks['mutations'],
  env: {
    useFlag: onPremFlag,
    useGetEnvironment: () => onPremEnv,
  },
  api: onPremApi as unknown as PlatformHooks['api'],
};
