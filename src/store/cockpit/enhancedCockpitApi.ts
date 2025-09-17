import { cockpitApi } from './cockpitApi';

const enhancedApi = cockpitApi.enhanceEndpoints({
  addTagTypes: ['Blueprint', 'Blueprints', 'Composes', 'WorkerConfig'],
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
      invalidatesTags: [{ type: 'Blueprints' }, { type: 'Composes' }],
    },
    composeBlueprint: {
      invalidatesTags: [{ type: 'Composes' }],
    },
    getComposes: {
      providesTags: [{ type: 'Composes' }],
    },
    getBlueprintComposes: {
      providesTags: [{ type: 'Composes' }],
    },
  },
});

export { enhancedApi as cockpitApi };
