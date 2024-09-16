import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/cloudapi.yml',
  apiFile: '../../src/store/emptyCloudApi.ts',
  apiImport: 'emptyCloudApi',
  outputFile: '../../src/store/cloudApi.ts',
  exportName: 'cloudApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  filterEndpoints: [
    'getComposeStatus',
    'getComposeMetadata',
    'getComposeLogs',
    'getComposeManifests',
    'postCloneCompose',
    'getCloneStatus',
    'postCompose',
  ],
};

export default config;
