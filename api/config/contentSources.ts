import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://console.redhat.com/api/content-sources/v1/openapi.json',
  apiFile: '../../src/store/apis/emptyContentSourcesApi.ts',
  apiImport: 'emptyContentSourcesApi',
  outputFile: '../../src/store/apis/contentSourcesApi.ts',
  exportName: 'contentSourcesApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: [
    'createRepository',
    'listRepositories',
    'listRepositoriesRpms',
    'listRepositoryParameters',
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
