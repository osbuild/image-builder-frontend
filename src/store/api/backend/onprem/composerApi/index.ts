import { architectureEndpoints } from './architecture';
import { blueprintEndpoints } from './blueprints';
import { composeEndpoints } from './composes';
import { oscapEndpoints } from './oscap';
import { registryEndpoints } from './registry';
import { uploadEndpoints } from './upload';

import { emptyComposerApi } from '../emptyComposerApi';

export const composerApi = emptyComposerApi.injectEndpoints({
  endpoints: (builder) => {
    return {
      ...architectureEndpoints(builder),
      ...blueprintEndpoints(builder),
      ...composeEndpoints(builder),
      ...oscapEndpoints(builder),
      ...registryEndpoints(builder),
      ...uploadEndpoints(builder),
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
  useLazyGetBlueprintQuery,
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
  useGetUploadConfigQuery,
  usePullImageMutation,
  useRegistryLoginMutation,
  useRegistryLogoutMutation,
  useUpdateUploadConfigMutation,
} = composerApi;

// re-export this for testing
export { getHostArch, getHostDistro } from './helpers';
