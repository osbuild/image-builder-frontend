import {
  errorMessage,
  imageBuilderApi,
} from './hosted/enhancedImageBuilderApi';
import * as serviceQueries from './hosted/imageBuilderApi';

import * as composerQueries from '../../cockpit/composerApi';
import { composerApi } from '../../cockpit/enhancedComposerApi';

export const useGetArchitecturesQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetArchitecturesQuery
  : serviceQueries.useGetArchitecturesQuery;

export const useGetBlueprintQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetBlueprintQuery
  : serviceQueries.useGetBlueprintQuery;

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetBlueprintsQuery
  : serviceQueries.useGetBlueprintsQuery;

export const useLazyGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useLazyGetBlueprintsQuery
  : serviceQueries.useLazyGetBlueprintsQuery;

export const useCreateBlueprintMutation = process.env.IS_ON_PREMISE
  ? composerQueries.useCreateBlueprintMutation
  : serviceQueries.useCreateBlueprintMutation;

export const useUpdateBlueprintMutation = process.env.IS_ON_PREMISE
  ? composerQueries.useUpdateBlueprintMutation
  : serviceQueries.useUpdateBlueprintMutation;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? composerQueries.useDeleteBlueprintMutation
  : serviceQueries.useDeleteBlueprintMutation;

export const useGetOscapProfilesQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetOscapProfilesQuery
  : serviceQueries.useGetOscapProfilesQuery;

export const useGetOscapCustomizationsQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetOscapCustomizationsQuery
  : serviceQueries.useGetOscapCustomizationsQuery;

export const useLazyGetOscapCustomizationsQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useLazyGetOscapCustomizationsQuery
  : serviceQueries.useLazyGetOscapCustomizationsQuery;

export const useGetComplianceCustomizationsQuery =
  serviceQueries.useGetOscapCustomizationsForPolicyQuery;

export const useLazyGetComplianceCustomizationsQuery =
  serviceQueries.useLazyGetOscapCustomizationsForPolicyQuery;

export const useComposeBlueprintMutation = process.env.IS_ON_PREMISE
  ? composerQueries.useComposeBlueprintMutation
  : serviceQueries.useComposeBlueprintMutation;

export const useGetComposesQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetComposesQuery
  : serviceQueries.useGetComposesQuery;

export const useGetBlueprintComposesQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetBlueprintComposesQuery
  : serviceQueries.useGetBlueprintComposesQuery;

export const useGetComposeStatusQuery = process.env.IS_ON_PREMISE
  ? composerQueries.useGetComposeStatusQuery
  : serviceQueries.useGetComposeStatusQuery;

export const useBackendPrefetch = process.env.IS_ON_PREMISE
  ? composerApi.usePrefetch
  : imageBuilderApi.usePrefetch;

export const backendApi = process.env.IS_ON_PREMISE
  ? composerApi
  : imageBuilderApi;

// These aren't used by on-prem so they aren't covered by the conditional
// exports above. Let's re-export them so we can consolidate our imports
// in other parts of the project.
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
  useLazyExportBlueprintCockpitQuery,
  usePodmanImagesQuery,
} from './onprem';

export { composerApi, errorMessage, imageBuilderApi };

export type * from './hosted';
