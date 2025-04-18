import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/contentSources.json',
  apiFile: '../../src/store/service/emptyContentSourcesApi.ts',
  apiImport: 'emptyContentSourcesApi',
  outputFile: '../../src/store/service/contentSourcesApi.ts',
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
    'listTemplates',
    'getTemplate',
  ],
};

export default config;
