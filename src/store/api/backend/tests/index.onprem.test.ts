import * as onprem from '../index.onprem';

// -- Value exports (hooks, slices, utilities) --

const expectedValueExports = [
  // Platform-switched hooks (from on-prem)
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
  // On-prem-only hooks
  'toComposerComposeRequest',
  'useExportBlueprintCockpitQuery',
  'useGetWorkerConfigQuery',
  'useLazyExportBlueprintCockpitQuery',
  'useUpdateWorkerConfigMutation',
  // Hosted-only hooks (still importable, gated at component level)
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

describe('index.onprem.ts — value exports', () => {
  test.each(expectedValueExports)('exports %s', (name) => {
    expect(onprem).toHaveProperty(name);
    expect((onprem as Record<string, unknown>)[name]).toBeDefined();
  });

  test('backendApi is the composerApi (on-prem slice)', () => {
    expect(onprem.backendApi).toBe(onprem.composerApi);
  });

  test('useBackendPrefetch is composerApi.usePrefetch', () => {
    expect(onprem.useBackendPrefetch).toBe(onprem.composerApi.usePrefetch);
  });
});
