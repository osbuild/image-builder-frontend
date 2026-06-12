import * as onprem from '../index.onprem';

// -- Value exports (hooks, slices, utilities) --

const expectedValueExports = [
  // Platform-switched hooks — sourced from on-prem
  'useSearchRpmMutation',
  'useListSnapshotsByDateMutation',
  // Hosted-only hooks (still importable, gated at component level)
  'useListFeaturesQuery',
  'useSearchPackageGroupMutation',
  'useSearchRepositoryModuleStreamsMutation',
  'useListRepositoriesQuery',
  'useCreateRepositoryMutation',
  'useBulkImportRepositoriesMutation',
  'useListRepositoriesRpmsQuery',
  'useListRepositoryParametersQuery',
  'useListTemplatesQuery',
  'useGetTemplateQuery',
  // API slice
  'contentSourcesApi',
  // Hooks from ./hooks
  'useSearchLanguagePacks',
] as const;

describe('index.onprem.ts — value exports', () => {
  test.each(expectedValueExports)('exports %s', (name) => {
    expect(onprem).toHaveProperty(name);
    expect((onprem as Record<string, unknown>)[name]).toBeDefined();
  });

  test('contentSourcesApi is the hosted contentSourcesApi (avoids duplicate middleware)', () => {
    // The on-prem alias intentionally exports the hosted contentSourcesApi
    // to avoid RTK duplicate middleware/reducer errors
    expect(onprem.contentSourcesApi).toBeDefined();
    expect(onprem.contentSourcesApi.reducerPath).toBe('contentSourcesApi');
  });

  test('platform-switched hooks come from on-prem, not hosted', async () => {
    const hostedModule = await import('../hosted');
    // The on-prem alias should source platform-switched hooks from
    // the on-prem module, not the hosted one
    expect(onprem.useSearchRpmMutation).not.toBe(
      hostedModule.useSearchRpmMutation,
    );
    expect(onprem.useListSnapshotsByDateMutation).not.toBe(
      hostedModule.useListSnapshotsByDateMutation,
    );
  });
});
