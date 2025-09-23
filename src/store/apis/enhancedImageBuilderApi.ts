import { imageBuilderApi } from './imageBuilderApi';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const errorMessage = (err: any) => {
  let msg = err.error.statusText;
  if (
    err.error.data?.errors &&
    err.error.data?.errors.length > 0 &&
    err.error.data?.errors[0]?.detail
  ) {
    msg = err.error.data?.errors[0]?.detail;
  }
  return msg;
};

const enhancedApi = imageBuilderApi.enhanceEndpoints({
  addTagTypes: [
    'Clone',
    'Compose',
    'Blueprints',
    'BlueprintComposes',
    'Blueprint',
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
    getComposeClones: {
      providesTags: (_request, _error, arg) => {
        return [{ type: 'Clone', id: arg.composeId }];
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
    cloneCompose: {
      onQueryStarted: async ({ composeId }, { dispatch, queryFulfilled }) => {
        queryFulfilled.then(() => {
          dispatch(
            imageBuilderApi.util.invalidateTags([
              // @ts-expect-error Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
              { type: 'Clone', id: composeId },
            ]),
          );
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
