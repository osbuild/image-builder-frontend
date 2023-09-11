import type { ConfigFile } from '@rtk-query/codegen-openapi';

const config: ConfigFile = {
  schemaFile: '../schema/edge.json',
  apiFile: '../../src/store/emptyEdgeApi.ts',
  apiImport: 'emptyEdgeApi',
  outputFile: '../../src/store/edgeApi.ts',
  exportName: 'edgeApi',
  hooks: true,
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
