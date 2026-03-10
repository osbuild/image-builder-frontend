import * as hostedQueries from './hosted';
import * as onpremQueries from './onprem';

export type * from './hosted';

// Hooks with different implementations for hosted vs on-prem
export const useSearchRpmMutation = process.env.IS_ON_PREMISE
  ? onpremQueries.useSearchRpmMutation
  : hostedQueries.useSearchRpmMutation;

export const useListSnapshotsByDateMutation = process.env.IS_ON_PREMISE
  ? onpremQueries.useListSnapshotsByDateMutation
  : hostedQueries.useListSnapshotsByDateMutation;

// NOTE: We have to explicitly export **only** the hosted contentSourcesApi
// here because of RTK. The on-prem version of the contentSourcesApi shares
// a base URL with the composerApi. This means it is very difficult to separate
// the two slices. If we were to export the on-prem contentSourcesApi here, we
// would get an error about duplicate middleware & reducers.
export const contentSourcesApi = hostedQueries.contentSourcesApi;

// Hosted-only hooks - components using these are gated and not shown in on-prem
export const {
  useListFeaturesQuery,
  useSearchPackageGroupMutation,
  useSearchRepositoryModuleStreamsMutation,
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
  useBulkImportRepositoriesMutation,
  useListRepositoriesRpmsQuery,
  useListRepositoryParametersQuery,
  useListTemplatesQuery,
  useGetTemplateQuery,
} = hostedQueries;
