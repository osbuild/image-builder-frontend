export * from './hooks';
export type * from './hosted';

// NOTE: We export the hosted contentSourcesApi here because the on-prem
// version shares a base URL with composerApi, causing duplicate
// middleware/reducer errors if both are registered. The hosted slice is
// registered but unused on-prem; on-prem content source queries go
// through the composerApi slice (emptyOnPremApi).
export { contentSourcesApi } from './hosted';

// Platform-switched hooks — sourced from on-prem
export { useSearchRpmMutation, useListSnapshotsByDateMutation } from './onprem';

// Hosted-only hooks — still importable, gated at the component level
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
