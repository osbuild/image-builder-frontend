// Platform-switched hooks — sourced from on-prem
export {
  toComposerComposeRequest,
  useComposeBlueprintMutation,
  useCreateBlueprintMutation,
  useDeleteBlueprintMutation,
  useExportBlueprintCockpitQuery,
  useGetArchitecturesQuery,
  useGetBlueprintComposesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useGetDistributionsQuery,
  useGetOscapCustomizationsQuery,
  useGetOscapProfilesQuery,
  useGetWorkerConfigQuery,
  useLazyExportBlueprintCockpitQuery,
  useLazyGetBlueprintsQuery,
  useLazyGetOscapCustomizationsQuery,
  useUpdateBlueprintMutation,
  useUpdateWorkerConfigMutation,
} from './onprem';

// API slices
export { composerApi } from './onprem/enhancedComposerApi';
export { composerApi as backendApi } from './onprem/enhancedComposerApi';
export {
  errorMessage,
  imageBuilderApi,
} from './hosted/enhancedImageBuilderApi';

// Prefetch — wired to on-prem slice
import { composerApi } from './onprem/enhancedComposerApi';
export const useBackendPrefetch = composerApi.usePrefetch;

// Hosted-only hooks — still importable, gated at the component level
export {
  useComposeImageMutation,
  useExportBlueprintQuery,
  useFixupBlueprintMutation,
  useGetPackagesQuery,
  useLazyExportBlueprintQuery,
  useLazyGetPackagesQuery,
  useRecommendPackageMutation,
} from './hosted';

// Compliance aliases (hosted-only)
export {
  useGetOscapCustomizationsForPolicyQuery as useGetComplianceCustomizationsQuery,
  useLazyGetOscapCustomizationsForPolicyQuery as useLazyGetComplianceCustomizationsQuery,
} from './hosted';

// Hooks that use selectIsOnPremise internally
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
