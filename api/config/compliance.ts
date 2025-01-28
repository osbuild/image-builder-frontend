import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/compliance.json',
  apiFile: '../../src/store/service/emptyComplianceApi.ts',
  apiImport: 'emptyComplianceApi',
  outputFile: '../../src/store/service/complianceApi.ts',
  exportName: 'complianceApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: ['policies', 'policy'],
};

export default config;
