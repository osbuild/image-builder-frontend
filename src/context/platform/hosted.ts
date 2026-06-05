import { useMemo } from 'react';

import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useFlag as useUnleashFlag } from '@unleash/proxy-client-react';

import { imageBuilderApi } from '@/store/api/backend/hosted/enhancedImageBuilderApi';
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
} from '@/store/api/backend/hosted/imageBuilderApi';
import {
  contentSourcesApi,
  useListSnapshotsByDateMutation,
  useSearchRpmMutation,
} from '@/store/api/contentSources/hosted';

import type { PlatformHooks } from './types';

// Hoisted stable function references to avoid per-call allocations
const isBetaTrue = () => true;
const isBetaFalse = () => false;

const useHostedGetEnvironment = () => {
  const { isBeta, isProd, getEnvironment } = useChrome();
  const isBetaStable =
    isBeta() || getEnvironment() === 'qa' ? isBetaTrue : isBetaFalse;
  return useMemo(
    () => ({ isBeta: isBetaStable, isProd }),
    [isBetaStable, isProd],
  );
};

const hostedQueries = {
  // PlatformHooks uses the on-prem type which accepts wider input.
  // The hosted version is narrower, but runtime behavior is identical.
  useGetArchitecturesQuery:
    useGetArchitecturesQuery as unknown as PlatformHooks['queries']['useGetArchitecturesQuery'],
  useGetDistributionsQuery:
    useGetDistributionsQuery as unknown as PlatformHooks['queries']['useGetDistributionsQuery'],
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

const hostedMutations = {
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useDeleteBlueprintMutation,
  useComposeBlueprintMutation,
  useSearchRpmMutation,
  useListSnapshotsByDateMutation,
} satisfies Record<keyof PlatformHooks['mutations'], unknown>;

const hostedApi = {
  backendApi: imageBuilderApi,
  contentSourcesApi,
  useBackendPrefetch: imageBuilderApi.usePrefetch,
} satisfies Record<keyof PlatformHooks['api'], unknown>;

export const hostedPlatform: PlatformHooks = {
  queries: hostedQueries as unknown as PlatformHooks['queries'],
  mutations: hostedMutations as unknown as PlatformHooks['mutations'],
  env: {
    useFlag: useUnleashFlag,
    useGetEnvironment: useHostedGetEnvironment,
  },
  api: hostedApi as unknown as PlatformHooks['api'],
};
