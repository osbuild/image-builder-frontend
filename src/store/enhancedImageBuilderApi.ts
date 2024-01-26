import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { imageBuilderApi } from './imageBuilderApi';

const enhancedApi = imageBuilderApi.enhanceEndpoints({
  addTagTypes: ['Clone', 'Compose', 'Blueprint'],
  endpoints: {
    getBlueprints: {
      providesTags: () => {
        return [{ type: 'Blueprint' }];
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
    cloneCompose: {
      onQueryStarted: async (
        { composeId, cloneRequest },
        { dispatch, queryFulfilled }
      ) => {
        queryFulfilled
          .then(() => {
            dispatch(
              imageBuilderApi.util.invalidateTags([
                // Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
                // @ts-expect-error
                { type: 'Clone', id: composeId },
              ])
            );

            dispatch(
              addNotification({
                variant: 'success',
                title:
                  'Your image is being shared to ' +
                  cloneRequest.region +
                  ' region',
              })
            );
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Your image could not be shared',
                description: `Status code ${err.status}: ${err.data.errors[0].detail}`,
              })
            );
          });
      },
    },
    composeImage: {
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled
          .then(() => {
            // Typescript is unaware of tag types being defined concurrently in enhanceEndpoints()
            // @ts-expect-error
            dispatch(imageBuilderApi.util.invalidateTags(['Compose']));
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Your image is being created',
              })
            );
          })
          .catch((err) => {
            let msg = err.error.statusText;
            if (err.error.data?.errors[0]?.detail) {
              msg = err.error.data?.errors[0]?.detail;
            }

            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Your image could not be created',
                description: 'Status code ' + err.error.status + ': ' + msg,
              })
            );
          });
      },
    },
    deleteBlueprint: {
      invalidatesTags: [{ type: 'Blueprint' }],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled
          .then(() => {
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Blueprint was deleted',
              })
            );
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Blueprint could not be deleted',
                description: `Status code ${err.error.status}: ${err.error.data.errors[0].detail}`,
              })
            );
          });
      },
    },
  },
});

export { enhancedApi as imageBuilderApi };
