import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/edge.json',
  apiFile: '../../src/store/emptyEdgeApi.ts',
  apiImport: 'emptyEdgeApi',
  outputFile: '../../src/store/edgeApi.ts',
  exportName: 'edgeApi',
  hooks: true,
  filterEndpoints: ['getAllImages', 'getImageStatusByID', 'getImageByID'],
};

export default config;
