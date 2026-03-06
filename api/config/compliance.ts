import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://console.redhat.com/api/compliance/v2/openapi.json',
  apiFile: '../../src/store/api/compliance/emptyComplianceApi.ts',
  apiImport: 'emptyComplianceApi',
  outputFile: '../../src/store/api/compliance/complianceApi.ts',
  exportName: 'complianceApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: ['policies', 'policy'],
};

export default config;
