import * as hosted from '../index.hosted';

// -- Value exports (hooks, slices, utilities) --

const expectedValueExports = [
  // Platform-switched hooks
  'useComposeBlueprintMutation',
  'useCreateBlueprintMutation',
  'useDeleteBlueprintMutation',
  'useGetArchitecturesQuery',
  'useGetBlueprintComposesQuery',
  'useGetBlueprintQuery',
  'useGetBlueprintsQuery',
  'useGetComposesQuery',
  'useGetComposeStatusQuery',
  'useGetDistributionsQuery',
  'useGetOscapCustomizationsQuery',
  'useGetOscapProfilesQuery',
  'useLazyGetBlueprintsQuery',
  'useLazyGetOscapCustomizationsQuery',
  'useUpdateBlueprintMutation',
  // Hosted-only hooks
  'useComposeImageMutation',
  'useExportBlueprintQuery',
  'useFixupBlueprintMutation',
  'useGetPackagesQuery',
  'useLazyExportBlueprintQuery',
  'useLazyGetPackagesQuery',
  'useRecommendPackageMutation',
  // Compliance aliases
  'useGetComplianceCustomizationsQuery',
  'useLazyGetComplianceCustomizationsQuery',
  // On-prem-only hooks (importable from both alias files)
  'toComposerComposeRequest',
  'useExportBlueprintCockpitQuery',
  'useGetWorkerConfigQuery',
  'useLazyExportBlueprintCockpitQuery',
  'useUpdateWorkerConfigMutation',
  // API slices
  'errorMessage',
  'imageBuilderApi',
  'backendApi',
  'composerApi',
  // Prefetch
  'useBackendPrefetch',
  // Internal hooks
  'useSecuritySummary',
] as const;

describe('index.hosted.ts — value exports', () => {
  test.each(expectedValueExports)('exports %s', (name) => {
    expect(hosted).toHaveProperty(name);
    expect((hosted as Record<string, unknown>)[name]).toBeDefined();
  });

  test('backendApi is the imageBuilderApi (hosted slice)', () => {
    expect(hosted.backendApi).toBe(hosted.imageBuilderApi);
  });

  test('useBackendPrefetch is imageBuilderApi.usePrefetch', () => {
    expect(hosted.useBackendPrefetch).toBe(hosted.imageBuilderApi.usePrefetch);
  });
});
