import * as aliased from '@/store/api/contentSources';

import * as hostedDirect from '../index.hosted';

describe('@/store/api/contentSources alias resolution', () => {
  test('contentSourcesApi is the hosted contentSourcesApi', () => {
    expect(aliased.contentSourcesApi).toBe(hostedDirect.contentSourcesApi);
  });

  test('useSearchRpmMutation matches hosted direct import', () => {
    expect(aliased.useSearchRpmMutation).toBe(
      hostedDirect.useSearchRpmMutation,
    );
  });

  test('useListSnapshotsByDateMutation matches hosted direct import', () => {
    expect(aliased.useListSnapshotsByDateMutation).toBe(
      hostedDirect.useListSnapshotsByDateMutation,
    );
  });
});
