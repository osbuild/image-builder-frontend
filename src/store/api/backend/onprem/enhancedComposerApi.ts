import { composerApi } from './composerApi';

const enhancedApi = composerApi.enhanceEndpoints({
  addTagTypes: [
    'Blueprint',
    'Blueprints',
    'Compose',
    'BlueprintComposes',
    'RegistryAuth',
    'UploadConfig',
  ],
  endpoints: {
    getBlueprint: {
      providesTags: () => {
        return [{ type: 'Blueprint' }];
      },
    },
    getBlueprints: {
      providesTags: () => {
        return [{ type: 'Blueprints' }];
      },
    },
    createBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }],
    },
    updateBlueprint: {
      invalidatesTags: [{ type: 'Blueprint' }, { type: 'Blueprints' }],
    },
    deleteBlueprint: {
      invalidatesTags: [
        { type: 'Blueprints' },
        { type: 'Compose' },
        { type: 'BlueprintComposes' },
      ],
    },
    composeBlueprint: {
      invalidatesTags: [{ type: 'Compose' }, { type: 'BlueprintComposes' }],
    },
    getComposes: {
      providesTags: [{ type: 'Compose' }],
    },
    getBlueprintComposes: {
      providesTags: [{ type: 'BlueprintComposes' }],
    },
    getRegistryAuthStatus: {
      providesTags: [{ type: 'RegistryAuth' }],
    },
    getUploadConfig: {
      providesTags: [{ type: 'UploadConfig' }],
    },
    registryLogin: {
      invalidatesTags: [{ type: 'RegistryAuth' }],
    },
    updateUploadConfig: {
      invalidatesTags: [{ type: 'UploadConfig' }],
    },
  },
});

export { enhancedApi as composerApi };
