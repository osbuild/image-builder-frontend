import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/rhsm.json',
  apiFile: '../../src/store/emptyRhsmApi.ts',
  apiImport: 'emptyRhsmApi',
  outputFile: '../../src/store/rhsmApi.ts',
  exportName: 'rhsmApi',
  hooks: true,
  filterEndpoints: ['listActivationKeys', 'showActivationKey'],
};

export default config;
