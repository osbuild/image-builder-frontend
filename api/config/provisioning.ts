import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/provisioning.json',
  apiFile: '../../src/store/service/emptyProvisioningApi.ts',
  apiImport: 'emptyProvisioningApi',
  outputFile: '../../src/store/service/provisioningApi.ts',
  exportName: 'provisioningApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: ['getSourceList', 'getSourceUploadInfo'],
};

export default config;
