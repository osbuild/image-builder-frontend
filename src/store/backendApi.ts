import {
  useGetBlueprintsQuery as useCockpitGetBlueprintsQuery,
  useDeleteBlueprintMutation as useCockpitDeleteMutation,
  useComposeBlueprintMutation as useCockpitComposeBlueprintMutation,
  useGetComposesQuery as useCockpitGetComposesQuery,
  useGetBlueprintComposesQuery as useCockpitGetBlueprintComposesQuery,
  useGetComposeStatusQuery as useCockpitGetComposeStatusQuery,
} from './cockpitApi';
import { cockpitApi } from './enhancedCockpitApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import {
  useGetBlueprintsQuery as useImageBuilderGetBlueprintsQuery,
  useDeleteBlueprintMutation as useImageBuilderDeleteMutation,
  useComposeBlueprintMutation as useImageBuilderComposeBlueprintMutation,
  useGetComposesQuery as useImageBuilderGetComposesQuery,
  useGetBlueprintComposesQuery as useImageBuilderGetBlueprintComposesQuery,
  useGetComposeStatusQuery as useImageBuilderGetComposeStatusQuery,
} from './imageBuilderApi';

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintsQuery
  : useImageBuilderGetBlueprintsQuery;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? useCockpitDeleteMutation
  : useImageBuilderDeleteMutation;

export const useComposeBlueprintMutation = process.env.IS_ON_PREMISE
  ? useCockpitComposeBlueprintMutation
  : useImageBuilderComposeBlueprintMutation;

export const useGetComposesQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetComposesQuery
  : useImageBuilderGetComposesQuery;

export const useGetBlueprintComposesQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintComposesQuery
  : useImageBuilderGetBlueprintComposesQuery;

export const useGetComposeStatusQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetComposeStatusQuery
  : useImageBuilderGetComposeStatusQuery;

export const backendApi = process.env.IS_ON_PREMISE
  ? cockpitApi
  : imageBuilderApi;
