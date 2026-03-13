import { architectureEndpoints } from './architecture';
import { blueprintEndpoints } from './blueprints';
import { composeEndpoints } from './composes';
import { oscapEndpoints } from './oscap';
import { podmanEndpoints } from './podman';
import { workerEndpoints } from './worker';

import { emptyComposerApi } from '../emptyComposerApi';

export const composerApi = emptyComposerApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      ...architectureEndpoints(builder),
      ...blueprintEndpoints(builder),
      ...composeEndpoints(builder),
      ...oscapEndpoints(builder),
      ...workerEndpoints(builder),
      ...podmanEndpoints(builder),
    };
  },
  // since we are inheriting some endpoints,
  // we want to make sure that we don't override
  // any existing endpoints.
  overrideExisting: 'throw',
});

export const {
  useGetArchitecturesQuery,
  useGetBlueprintQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useDeleteBlueprintMutation,
  useExportBlueprintCockpitQuery,
  useLazyExportBlueprintCockpitQuery,
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useComposeBlueprintMutation,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
  useGetWorkerConfigQuery,
  useUpdateWorkerConfigMutation,
  usePodmanImagesQuery,
  useLazyPodmanImagesQuery,
} = composerApi;

// re-export this for testing
export { toComposerComposeRequest } from './helpers';
