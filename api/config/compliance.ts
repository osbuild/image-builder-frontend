import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/compliance.json',
  apiFile: '../../src/store/emptyComplianceApi.ts',
  apiImport: 'emptyComplianceApi',
  outputFile: '../../src/store/complianceApi.ts',
  exportName: 'complianceApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: ['policies', 'policy'],
};

export default config;
