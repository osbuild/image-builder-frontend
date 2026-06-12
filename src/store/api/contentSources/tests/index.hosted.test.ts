import * as hosted from '../index.hosted';

// -- Value exports (hooks, slices, utilities) --

const expectedValueExports = [
  // Platform-switched hooks — sourced from hosted
  'useSearchRpmMutation',
  'useListSnapshotsByDateMutation',
  // Hosted-only hooks
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

describe('index.hosted.ts — value exports', () => {
  test.each(expectedValueExports)('exports %s', (name) => {
    expect(hosted).toHaveProperty(name);
    expect((hosted as Record<string, unknown>)[name]).toBeDefined();
  });

  test('contentSourcesApi is the hosted contentSourcesApi', () => {
    expect(hosted.contentSourcesApi).toBeDefined();
    expect(hosted.contentSourcesApi.reducerPath).toBe('contentSourcesApi');
  });

  test('platform-switched hooks come from hosted', () => {
    // The alias file re-exports the hosted hooks directly — verify they
    // are the same references as the ones on the hosted API slice
    expect(hosted.useSearchRpmMutation).toBe(
      hosted.contentSourcesApi.endpoints.searchRpm.useMutation,
    );
    expect(hosted.useListSnapshotsByDateMutation).toBe(
      hosted.contentSourcesApi.endpoints.listSnapshotsByDate.useMutation,
    );
  });
});
