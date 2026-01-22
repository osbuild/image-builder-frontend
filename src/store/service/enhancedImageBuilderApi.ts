import { imageBuilderApi } from '../imageBuilderApi';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const errorMessage = (err: any) => {
  let msg = err.statusText;
  if (
    err.data?.errors &&
    err.data?.errors.length > 0 &&
    err.data?.errors[0]?.detail
  ) {
    msg = err.data?.errors[0]?.detail;
  }
  return msg;
};

const enhancedApi = imageBuilderApi.enhanceEndpoints({
  addTagTypes: ['Compose', 'Blueprints', 'BlueprintComposes', 'Blueprint'],
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
    getBlueprintComposes: {
      providesTags: () => {
        return [{ type: 'BlueprintComposes' }];
      },
    },
    getComposes: {
      providesTags: () => {
        return [{ type: 'Compose' }];
      },
    },
    updateBlueprint: {
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(() => {
          dispatch(
            // @ts-expect-error Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
            imageBuilderApi.util.invalidateTags(['Blueprints', 'Blueprint']),
          );
        });
      },
    },
    createBlueprint: {
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(() => {
          // @ts-expect-error Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
          dispatch(imageBuilderApi.util.invalidateTags(['Blueprints']));
        });
      },
    },
    composeBlueprint: {
      invalidatesTags: [{ type: 'Compose' }, { type: 'BlueprintComposes' }],
    },
    composeImage: {
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(() => {
          dispatch(
            // @ts-expect-error Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
            imageBuilderApi.util.invalidateTags(['Blueprints', 'Compose']),
          );
        });
      },
    },
    deleteBlueprint: {
      invalidatesTags: [
        { type: 'Blueprints' },
        { type: 'BlueprintComposes' },
        { type: 'Compose' },
      ],
    },
    fixupBlueprint: {
      invalidatesTags: [{ type: 'Blueprint' }],
    },
  },
});

export { enhancedApi as imageBuilderApi };
