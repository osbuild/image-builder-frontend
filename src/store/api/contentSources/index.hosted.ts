export * from './hooks';
export type * from './hosted';

export { contentSourcesApi } from './hosted';

// Platform-switched hooks — sourced from hosted
export { useSearchRpmMutation, useListSnapshotsByDateMutation } from './hosted';

// Hosted-only hooks
export {
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
} from './hosted';
