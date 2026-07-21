import { architectureEndpoints } from './architecture';
import { blueprintEndpoints } from './blueprints';
import { composeEndpoints } from './composes';
import { oscapEndpoints } from './oscap';
import { registryEndpoints } from './registry';
import { workerEndpoints } from './worker';

import { emptyComposerApi } from '../emptyComposerApi';

export const composerApi = emptyComposerApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      ...architectureEndpoints(builder),
      ...blueprintEndpoints(builder),
      ...composeEndpoints(builder),
      ...oscapEndpoints(builder),
      ...registryEndpoints(builder),
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
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useComposeBlueprintMutation,
  useGetComposesQuery,
  useGetBlueprintComposesQuery,
  useGetComposeStatusQuery,
  useGetImageExistsQuery,
  useGetRegistryAuthStatusQuery,
  useLazyGetImageExistsQuery,
  useGetWorkerConfigQuery,
  usePullImageMutation,
  useRegistryLoginMutation,
  useRegistryLogoutMutation,
  useUpdateWorkerConfigMutation,
} = composerApi;

// re-export this for testing
export {
  getHostArch,
  getHostDistro,
  toComposerComposeRequest,
} from './helpers';
