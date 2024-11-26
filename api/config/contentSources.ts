import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/contentSources.json',
  apiFile: '../../src/store/emptyContentSourcesApi.ts',
  apiImport: 'emptyContentSourcesApi',
  outputFile: '../../src/store/contentSourcesApi.ts',
  exportName: 'contentSourcesApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: [
    'createRepository',
    'listRepositories',
    'listRepositoriesRpms',
    'searchRpm',
    'searchPackageGroup',
    'listFeatures',
    'listSnapshotsByDate',
    'bulkImportRepositories',
  ],
};

export default config;
