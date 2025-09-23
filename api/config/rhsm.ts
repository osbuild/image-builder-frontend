import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://console.redhat.com/api/rhsm/v2/openapi.json',
  apiFile: '../../src/store/apis/emptyRhsmApi.ts',
  apiImport: 'emptyRhsmApi',
  outputFile: '../../src/store/apis/rhsmApi.ts',
  exportName: 'rhsmApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: [
    'listActivationKeys',
    'showActivationKey',
    'createActivationKeys',
  ],
};

export default config;
