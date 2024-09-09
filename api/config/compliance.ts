import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/compliance.json',
  apiFile: '../../src/store/emptyComplianceApi.ts',
  apiImport: 'emptyComplianceApi',
  outputFile: '../../src/store/complianceApi.ts',
  exportName: 'complianceApi',
  hooks: true,
  filterEndpoints: [],
};

export default config;
