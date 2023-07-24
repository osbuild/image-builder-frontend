import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
  schemaFile: '../schema/imageBuilder.json',
  apiFile: '../../src/store/emptyImageBuilderApi.ts',
  apiImport: 'emptyImageBuilderApi',
  outputFile: '../../src/store/imageBuilderApi.ts',
  exportName: 'imageBuilderApi',
  hooks: true,
  filterEndpoints: ['getComposes', 'getComposeStatus', 'getComposeClones', 'getCloneStatus', 'getArchitectures', 'getPackages'],
}

export default config
