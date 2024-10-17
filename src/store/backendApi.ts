import { useGetBlueprintsQuery as useCockpitGetBlueprintsQuery } from './cockpitApi';
import { useGetBlueprintsQuery as useImageBuilderGetBlueprintsQuery } from './imageBuilderApi';

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintsQuery
  : useImageBuilderGetBlueprintsQuery;
