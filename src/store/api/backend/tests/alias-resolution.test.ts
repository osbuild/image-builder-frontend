import * as aliased from '@/store/api/backend';

import * as hostedDirect from '../index.hosted';

describe('@/store/api/backend alias resolution', () => {
  test('backendApi is the hosted imageBuilderApi', () => {
    expect(aliased.backendApi).toBe(aliased.imageBuilderApi);
  });

  test('useBackendPrefetch matches hosted direct import', () => {
    expect(aliased.useBackendPrefetch).toBe(hostedDirect.useBackendPrefetch);
  });

  test('key hooks resolve to the same references as index.hosted.ts', () => {
    expect(aliased.useGetArchitecturesQuery).toBe(
      hostedDirect.useGetArchitecturesQuery,
    );
    expect(aliased.useGetBlueprintsQuery).toBe(
      hostedDirect.useGetBlueprintsQuery,
    );
    expect(aliased.useCreateBlueprintMutation).toBe(
      hostedDirect.useCreateBlueprintMutation,
    );
  });
});
