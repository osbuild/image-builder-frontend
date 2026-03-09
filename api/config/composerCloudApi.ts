import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile:
    'https://raw.githubusercontent.com/osbuild/osbuild-composer/main/internal/cloudapi/v2/openapi.v2.yml',
  apiFile: '../../src/store/api/shared/emptyOnPremApi.ts',
  apiImport: 'emptyOnPremApi',
  outputFile: '../../src/store/cockpit/composerCloudApi.ts',
  exportName: 'composerCloudApi',
  hooks: false,
  unionUndefined: true,
  filterEndpoints: ['postCompose', 'getComposeStatus'],
};

export default config;
