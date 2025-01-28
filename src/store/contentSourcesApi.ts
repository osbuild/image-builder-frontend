import * as cockpitQueries from './cockpit/contentSourcesApi';
import * as serviceQueries from './service/contentSourcesApi';

export const useListSnapshotsByDateMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useListSnapshotsByDateMutation
  : serviceQueries.useListSnapshotsByDateMutation;

export const {
  useListFeaturesQuery,
  useSearchRpmMutation,
  useSearchPackageGroupMutation,
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
  useBulkImportRepositoriesMutation,
  useListRepositoriesRpmsQuery,
  contentSourcesApi,
} = serviceQueries;

// we need to re-export all the types
export type * from './service/contentSourcesApi';
