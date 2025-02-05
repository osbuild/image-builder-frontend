import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/composerCloudApi.v2.yaml',
  apiFile: '../../src/store/cockpit/emptyComposerCloudApi.ts',
  apiImport: 'emptyComposerCloudApi',
  outputFile: '../../src/store/cockpit/composerCloudApi.ts',
  exportName: 'composerCloudApi',
  hooks: false,
  unionUndefined: true,
  filterEndpoints: [
    'postCompose',
    'getComposeStatus',
  ],
};

export default config;
