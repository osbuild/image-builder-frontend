import { useGetBlueprintsQuery as useImageBuilderGetBlueprintsQuery } from './imageBuilderApi';
import { useGetBlueprintsQuery as useCockpitGetBlueprintsQuery } from './cockpitApi';

export const useGetBlueprintsQuery = process.env.IS_ON_PREMISE
  ? useCockpitGetBlueprintsQuery
  : useImageBuilderGetBlueprintsQuery;
