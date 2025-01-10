import {
  useGetArchitecturesQuery as useCockpitGetArchitecturesQuery,
  useGetBlueprintsQuery as useCockpitGetBlueprintsQuery,
  useDeleteBlueprintMutation as useCockpitDeleteMutation,
} from './cockpitApi';
import { cockpitApi } from './enhancedCockpitApi';
import { imageBuilderApi } from './enhancedImageBuilderApi';
import {
  useGetArchitecturesQuery as useImageBuilderGetArchitecturesQuery,
  useGetBlueprintsQuery as useImageBuilderGetBlueprintsQuery,
  useDeleteBlueprintMutation as useImageBuilderDeleteMutation,
} from './imageBuilderApi';

export const useGetArchitecturesQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetArchitecturesQuery
  : useImageBuilderGetArchitecturesQuery;

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintsQuery
  : useImageBuilderGetBlueprintsQuery;

export const useDeleteBlueprintMutation = process.env.IS_ON_PREMISE
  ? useCockpitDeleteMutation
  : useImageBuilderDeleteMutation;

export const backendApi = process.env.IS_ON_PREMISE
  ? cockpitApi
  : imageBuilderApi;
