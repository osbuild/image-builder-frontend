import type { imageBuilderApi } from '@/store/api/backend/hosted/enhancedImageBuilderApi';
import type {
  useComposeBlueprintMutation as useHostedComposeBlueprintMutation,
  useCreateBlueprintMutation as useHostedCreateBlueprintMutation,
  useDeleteBlueprintMutation as useHostedDeleteBlueprintMutation,
  useGetBlueprintComposesQuery as useHostedGetBlueprintComposesQuery,
  useGetBlueprintQuery as useHostedGetBlueprintQuery,
  useGetBlueprintsQuery as useHostedGetBlueprintsQuery,
  useGetComposesQuery as useHostedGetComposesQuery,
  useGetComposeStatusQuery as useHostedGetComposeStatusQuery,
  useGetOscapCustomizationsQuery as useHostedGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery as useHostedGetOscapProfilesQuery,
  useLazyGetBlueprintsQuery as useHostedLazyGetBlueprintsQuery,
  useLazyGetOscapCustomizationsQuery as useHostedLazyGetOscapCustomizationsQuery,
  useUpdateBlueprintMutation as useHostedUpdateBlueprintMutation,
} from '@/store/api/backend/hosted/imageBuilderApi';
import type {
  useGetArchitecturesQuery as useComposerGetArchitecturesQuery,
  useGetDistributionsQuery as useComposerGetDistributionsQuery,
} from '@/store/api/backend/onprem/composerApi';
import type {
  contentSourcesApi,
  useListSnapshotsByDateMutation as useHostedListSnapshotsByDateMutation,
  useSearchRpmMutation as useHostedSearchRpmMutation,
} from '@/store/api/contentSources/hosted/contentSourcesApi';

// The useGetArchitecturesQuery and useGetDistributionsQuery types are
// widened to the composer (on-prem) versions because they accept wider
// input types. The response shapes are identical across platforms.
type UseGetArchitecturesQuery = typeof useComposerGetArchitecturesQuery;
type UseGetDistributionsQuery = typeof useComposerGetDistributionsQuery;

type PlatformHooks = {
  queries: {
    useGetArchitecturesQuery: UseGetArchitecturesQuery;
    useGetDistributionsQuery: UseGetDistributionsQuery;
    useGetBlueprintQuery: typeof useHostedGetBlueprintQuery;
    useGetBlueprintsQuery: typeof useHostedGetBlueprintsQuery;
    useLazyGetBlueprintsQuery: typeof useHostedLazyGetBlueprintsQuery;
    useGetOscapProfilesQuery: typeof useHostedGetOscapProfilesQuery;
    useGetOscapCustomizationsQuery: typeof useHostedGetOscapCustomizationsQuery;
    useLazyGetOscapCustomizationsQuery: typeof useHostedLazyGetOscapCustomizationsQuery;
    useGetComposesQuery: typeof useHostedGetComposesQuery;
    useGetBlueprintComposesQuery: typeof useHostedGetBlueprintComposesQuery;
    useGetComposeStatusQuery: typeof useHostedGetComposeStatusQuery;
  };
  mutations: {
    useCreateBlueprintMutation: typeof useHostedCreateBlueprintMutation;
    useUpdateBlueprintMutation: typeof useHostedUpdateBlueprintMutation;
    useDeleteBlueprintMutation: typeof useHostedDeleteBlueprintMutation;
    useComposeBlueprintMutation: typeof useHostedComposeBlueprintMutation;
    useSearchRpmMutation: typeof useHostedSearchRpmMutation;
    useListSnapshotsByDateMutation: typeof useHostedListSnapshotsByDateMutation;
  };
  env: {
    useFlag: (flag: string) => boolean;
    useGetEnvironment: () => { isBeta: () => boolean; isProd: () => boolean };
  };
  api: {
    backendApi: typeof imageBuilderApi;
    contentSourcesApi: typeof contentSourcesApi;
    useBackendPrefetch: typeof imageBuilderApi.usePrefetch;
  };
};

export type { PlatformHooks };
