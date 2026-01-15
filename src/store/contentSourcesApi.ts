import * as cockpitQueries from './cockpit/contentSourcesApi';
import * as serviceQueries from './service/contentSourcesApi';

export const useSearchRpmMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useSearchRpmMutation
  : serviceQueries.useSearchRpmMutation;

export const useListSnapshotsByDateMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useListSnapshotsByDateMutation
  : serviceQueries.useListSnapshotsByDateMutation;

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
  contentSourcesApi,
} = serviceQueries;

// we need to re-export all the types
export type * from './service/contentSourcesApi';
