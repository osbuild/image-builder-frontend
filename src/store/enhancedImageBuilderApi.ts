import { imageBuilderApi } from './imageBuilderApi';

const enhancedApi = imageBuilderApi.enhanceEndpoints({
  addTagTypes: ['Clone', 'Compose'],
  endpoints: {
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
    cloneCompose: {
      onQueryStarted: async (
        { composeId, cloneRequest },
        { dispatch, queryFulfilled }
      ) => {
        queryFulfilled.then(() => {
          dispatch(
            imageBuilderApi.util.invalidateTags([
              // Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
              // @ts-expect-error
              { type: 'Clone', id: composeId },
            ])
          );
        });
      },
    },
    composeImage: {
      onQueryStarted: async (
        { composeRequest },
        { dispatch, queryFulfilled }
      ) => {
        queryFulfilled.then(() => {
          // Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
          // @ts-expect-error
          dispatch(imageBuilderApi.util.invalidateTags(['Compose']));
        });
      },
    },
  },
});

export { enhancedApi as imageBuilderApi };
