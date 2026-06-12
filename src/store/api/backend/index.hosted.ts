// Platform-switched hooks — sourced from hosted
export {
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
} from './hosted';

// Hosted-only hooks (not available on-prem)
export {
  useComposeImageMutation,
  useExportBlueprintQuery,
  useFixupBlueprintMutation,
  useGetPackagesQuery,
  useLazyExportBlueprintQuery,
  useLazyGetPackagesQuery,
  useRecommendPackageMutation,
} from './hosted';

// Compliance aliases (hosted-only, rename for consumer clarity)
export {
  useGetOscapCustomizationsForPolicyQuery as useGetComplianceCustomizationsQuery,
  useLazyGetOscapCustomizationsForPolicyQuery as useLazyGetComplianceCustomizationsQuery,
} from './hosted';

// On-prem-only hooks — importable from both alias files so consumers
// that import them from '@/store/api/backend' don't break
export {
  toComposerComposeRequest,
  useExportBlueprintCockpitQuery,
  useGetWorkerConfigQuery,
  useLazyExportBlueprintCockpitQuery,
  useUpdateWorkerConfigMutation,
} from './onprem';

// API slices
export {
  errorMessage,
  imageBuilderApi,
} from './hosted/enhancedImageBuilderApi';
export { imageBuilderApi as backendApi } from './hosted/enhancedImageBuilderApi';
export { composerApi } from './onprem/enhancedComposerApi';

// Prefetch — wired to hosted slice
import { imageBuilderApi } from './hosted/enhancedImageBuilderApi';
export const useBackendPrefetch = imageBuilderApi.usePrefetch;

// Hooks that use selectIsOnPremise internally (not ternary-switched)
export { useSecuritySummary } from './hooks';

// Types — re-export all hosted types as canonical
export type * from './hosted';
// On-prem types that don't conflict
export type {
  ComposerCreateBlueprintApiArg,
  ComposerCreateBlueprintRequest,
  ComposerUpdateBlueprintApiArg,
  ComposerBlueprint,
  ComposerComposeRequest,
  ComposerCustomizations,
  ComposerImageTypes,
  ComposerAwsUploadRequestOptions,
  ComposerComposesResponseItem,
  ComposerImageRequest,
  ComposerUploadTypes,
  AWSWorkerConfig,
  CloudProviderConfigState,
  UpdateWorkerConfigApiArg,
  WorkerConfigFile,
  WorkerConfigRequest,
  WorkerConfigResponse,
  Bootc,
  LocalUploadStatus,
} from './onprem';
