import * as cockpitQueries from './cockpit/contentSourcesApi';
import * as serviceQueries from './service/contentSourcesApi';

export const useSearchRpmMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useSearchRpmMutation
  : serviceQueries.useSearchRpmMutation;

export const useListSnapshotsByDateMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useListSnapshotsByDateMutation
  : serviceQueries.useListSnapshotsByDateMutation;

export const useCreateRepositoryMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useCreateRepositoryMutation
  : serviceQueries.useCreateRepositoryMutation;

export const useListRepositoriesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useListRepositoriesQuery
  : serviceQueries.useListRepositoriesQuery;

export const {
  useListFeaturesQuery,
  useSearchPackageGroupMutation,
  useBulkImportRepositoriesMutation,
  useListRepositoriesRpmsQuery,
  useListRepositoryParametersQuery,
  useListTemplatesQuery,
  useGetTemplateQuery,
  contentSourcesApi,
} = serviceQueries;

// we need to re-export all the types
export type * from './service/contentSourcesApi';
