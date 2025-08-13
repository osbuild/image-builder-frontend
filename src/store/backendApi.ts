import * as cockpitQueries from './cockpit/cockpitApi';
import { cockpitApi } from './cockpit/enhancedCockpitApi';
import { imageBuilderApi } from './service/enhancedImageBuilderApi';
import * as serviceQueries from './service/imageBuilderApi';

export const useGetArchitecturesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetArchitecturesQuery
  : serviceQueries.useGetArchitecturesQuery;

export const useGetBlueprintQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintQuery
  : serviceQueries.useGetBlueprintQuery;

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintsQuery
  : serviceQueries.useGetBlueprintsQuery;

export const useLazyGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useLazyGetBlueprintsQuery
  : serviceQueries.useLazyGetBlueprintsQuery;

export const useCreateBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useCreateBlueprintMutation
  : serviceQueries.useCreateBlueprintMutation;

export const useUpdateBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useUpdateBlueprintMutation
  : serviceQueries.useUpdateBlueprintMutation;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useDeleteBlueprintMutation
  : serviceQueries.useDeleteBlueprintMutation;

export const useGetOscapProfilesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetOscapProfilesQuery
  : serviceQueries.useGetOscapProfilesQuery;

export const useGetOscapCustomizationsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetOscapCustomizationsQuery
  : serviceQueries.useGetOscapCustomizationsQuery;

export const useLazyGetOscapCustomizationsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useLazyGetOscapCustomizationsQuery
  : serviceQueries.useLazyGetOscapCustomizationsQuery;

export const useGetComplianceCustomizationsQuery =
  serviceQueries.useGetOscapCustomizationsForPolicyQuery;

export const useLazyGetComplianceCustomizationsQuery =
  serviceQueries.useLazyGetOscapCustomizationsForPolicyQuery;

export const useComposeBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useComposeBlueprintMutation
  : serviceQueries.useComposeBlueprintMutation;

export const useGetComposesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetComposesQuery
  : serviceQueries.useGetComposesQuery;

export const useGetBlueprintComposesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintComposesQuery
  : serviceQueries.useGetBlueprintComposesQuery;

export const useGetComposeStatusQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetComposeStatusQuery
  : serviceQueries.useGetComposeStatusQuery;

export const useBackendPrefetch = process.env.IS_ON_PREMISE
  ? cockpitApi.usePrefetch
  : imageBuilderApi.usePrefetch;

export const backendApi = process.env.IS_ON_PREMISE
  ? cockpitApi
  : imageBuilderApi;
