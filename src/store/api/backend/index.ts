import {
  errorMessage,
  imageBuilderApi,
} from './hosted/enhancedImageBuilderApi';
import * as serviceQueries from './hosted/imageBuilderApi';
import { composerApi } from './onprem/enhancedComposerApi';

// Hosted-only aliases for compliance endpoints (not platform-switched)
export const useGetComplianceCustomizationsQuery =
  serviceQueries.useGetOscapCustomizationsForPolicyQuery;
export const useLazyGetComplianceCustomizationsQuery =
  serviceQueries.useLazyGetOscapCustomizationsForPolicyQuery;

// Platform-independent hooks — hosted-only, not part of the platform switching
export {
  useComposeImageMutation,
  useExportBlueprintQuery,
  useFixupBlueprintMutation,
  useGetPackagesQuery,
  useLazyExportBlueprintQuery,
  useLazyGetPackagesQuery,
  useRecommendPackageMutation,
} from './hosted';
export {
  toComposerComposeRequest,
  useExportBlueprintCockpitQuery,
  useGetWorkerConfigQuery,
  useLazyExportBlueprintCockpitQuery,
  useUpdateWorkerConfigMutation,
} from './onprem';

export { composerApi, errorMessage, imageBuilderApi };

// Re-export all types from hosted API (primary/canonical types)
export type * from './hosted';
// Selectively re-export on-prem types that don't conflict with hosted
// The on-prem types module already prefixes conflicting types (e.g., ComposerBlueprint)
export type {
  // Custom on-prem API argument types
  ComposerCreateBlueprintApiArg,
  ComposerCreateBlueprintRequest,
  ComposerUpdateBlueprintApiArg,
  // Prefixed types to avoid conflicts with hosted
  ComposerBlueprint,
  ComposerComposeRequest,
  ComposerCustomizations,
  ComposerImageTypes,
  // On-prem specific types
  ComposerAwsUploadRequestOptions,
  ComposerComposesResponseItem,
  ComposerImageRequest,
  ComposerUploadTypes,
  // Worker config types (on-prem only)
  AWSWorkerConfig,
  CloudProviderConfigState,
  UpdateWorkerConfigApiArg,
  WorkerConfigFile,
  WorkerConfigRequest,
  WorkerConfigResponse,
  // Non-conflicting generated types
  Bootc,
  LocalUploadStatus,
} from './onprem';

export { useSecuritySummary } from './hooks';
