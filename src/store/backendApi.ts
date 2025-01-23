import * as cockpitQueries from './cockpitApi';
import { useListSnapshotsByDateMutation as useContentSourcesListSnapshotsByDateMutation } from './contentSourcesApi';
import { cockpitApi } from './enhancedCockpitApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import * as imageBuilderQueries from './imageBuilderApi';

export const useGetArchitecturesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetArchitecturesQuery
  : imageBuilderQueries.useGetArchitecturesQuery;

export const useGetBlueprintQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintQuery
  : imageBuilderQueries.useGetBlueprintQuery;

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintsQuery
  : imageBuilderQueries.useGetBlueprintsQuery;

export const useLazyGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useLazyGetBlueprintsQuery
  : imageBuilderQueries.useLazyGetBlueprintsQuery;

export const useCreateBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useCreateBlueprintMutation
  : imageBuilderQueries.useCreateBlueprintMutation;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useDeleteBlueprintMutation
  : imageBuilderQueries.useDeleteBlueprintMutation;

export const useGetOscapProfilesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetOscapProfilesQuery
  : imageBuilderQueries.useGetOscapProfilesQuery;

export const useListSnapshotsByDateMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useListSnapshotsByDateMutation
  : useContentSourcesListSnapshotsByDateMutation;

export const useComposeBlueprintMutation = process.env.IS_ON_PREMISE
  ? cockpitQueries.useComposeBlueprintMutation
  : imageBuilderQueries.useComposeBlueprintMutation;

export const useGetComposesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetComposesQuery
  : imageBuilderQueries.useGetComposesQuery;

export const useGetBlueprintComposesQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetBlueprintComposesQuery
  : imageBuilderQueries.useGetBlueprintComposesQuery;

export const useGetComposeStatusQuery = process.env.IS_ON_PREMISE
  ? cockpitQueries.useGetComposeStatusQuery
  : imageBuilderQueries.useGetComposeStatusQuery;

export const useBackendPrefetch = process.env.IS_ON_PREMISE
  ? cockpitApi.usePrefetch
  : imageBuilderApi.usePrefetch;

export const backendApi = process.env.IS_ON_PREMISE
  ? cockpitApi
  : imageBuilderApi;
