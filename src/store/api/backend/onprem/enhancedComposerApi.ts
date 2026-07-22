import { composerApi } from './composerApi';

const enhancedApi = composerApi.enhanceEndpoints({
  addTagTypes: [
    'Blueprint',
    'Blueprints',
    'Compose',
    'BlueprintComposes',
    'Distributions',
    'RegistryAuth',
    'WorkerConfig',
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
    getDistributions: {
      providesTags: [{ type: 'Distributions' }],
    },
    getRegistryAuthStatus: {
      providesTags: [{ type: 'RegistryAuth' }],
    },
    getWorkerConfig: {
      providesTags: [{ type: 'WorkerConfig' }],
    },
    registryLogin: {
      // Write the login result directly into the auth status cache.
      // The mutation already returns RegistryAuthStatus so there is
      // no need to invalidate and re-run checkRegistryAuth (which
      // spawns two podman commands).
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            composerApi.util.updateQueryData(
              'getRegistryAuthStatus',
              undefined,
              () => data,
            ),
          );
        } catch {
          // mutation failed — no cache update needed
        }
      },
      invalidatesTags: [{ type: 'Distributions' }],
    },
    registryLogout: {
      invalidatesTags: [{ type: 'RegistryAuth' }],
    },
    updateWorkerConfig: {
      invalidatesTags: [{ type: 'WorkerConfig' }],
    },
  },
});

export { enhancedApi as composerApi };
