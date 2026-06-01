import { architectureEndpoints } from './architecture';
import { blueprintEndpoints } from './blueprints';
import { composeEndpoints } from './composes';
import { distributionEndpoints } from './distribution';
import { oscapEndpoints } from './oscap';
import { workerEndpoints } from './worker';

import { emptyComposerApi } from '../emptyComposerApi';

export const composerApi = emptyComposerApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      ...architectureEndpoints(builder),
      ...blueprintEndpoints(builder),
      ...composeEndpoints(builder),
      ...distributionEndpoints(builder),
      ...oscapEndpoints(builder),
      ...workerEndpoints(builder),
    };
  },
  // since we are inheriting some endpoints,
  // we want to make sure that we don't override
  // any existing endpoints.
  overrideExisting: 'throw',
});

export const {
  useGetArchitecturesQuery,
  useGetDistributionsQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useDeleteBlueprintMutation,
  useExportBlueprintCockpitQuery,
  useLazyExportBlueprintCockpitQuery,
  useGetDistributionQuery,
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useComposeBlueprintMutation,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
  useGetWorkerConfigQuery,
  useUpdateWorkerConfigMutation,
} = composerApi;

// re-export this for testing
export { toComposerComposeRequest } from './helpers';
