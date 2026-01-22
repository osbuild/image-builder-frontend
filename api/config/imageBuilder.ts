import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile:
    'https://raw.githubusercontent.com/osbuild/image-builder/main/internal/v1/api.yaml',
  apiFile: '../../src/store/service/emptyImageBuilderApi.ts',
  apiImport: 'emptyImageBuilderApi',
  outputFile: '../../src/store/service/imageBuilderApi.ts',
  exportName: 'imageBuilderApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  unionUndefined: true,
  filterEndpoints: [
    'composeImage',
    'getComposes',
    'getComposeStatus',
    'getArchitectures',
    'getPackages',
    'getOscapProfiles',
    'getOscapCustomizations',
    'getOscapCustomizationsForPolicy',
    'createBlueprint',
    'updateBlueprint',
    'composeBlueprint',
    'getBlueprints',
    'exportBlueprint',
    'getBlueprintComposes',
    'deleteBlueprint',
    'getBlueprint',
    'recommendPackage',
    'fixupBlueprint',
  ],
};

export default config;
