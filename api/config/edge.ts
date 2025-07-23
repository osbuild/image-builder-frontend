import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: 'https://console.redhat.com/api/edge/v1/openapi.json',
  apiFile: '../../src/store/service/emptyEdgeApi.ts',
  apiImport: 'emptyEdgeApi',
  outputFile: '../../src/store/service/edgeApi.ts',
  exportName: 'edgeApi',
  hooks: true,
  unionUndefined: true,
  filterEndpoints: [
    'createImage',
    'createImageUpdate',
    'getAllImages',
    'getImageStatusByID',
    'getImageByID',
    'getImageDetailsByID',
    'getImageByOstree',
    'createInstallerForImage',
    'getRepoForImage',
    'getMetadataForImage',
    'createKickStartForImage',
    'checkImageName',
    'retryCreateImage',
    'listAllImageSets',
    'getImageSetsByID',
    'getImageSetsView',
    'getImageSetViewByID',
    'getAllImageSetImagesView',
    'getImageSetsDevicesByID',
    'deleteImageSet',
    'getImageSetImageView',
  ],
};

export default config;
