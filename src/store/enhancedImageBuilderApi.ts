import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

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
            let msg = err.response.statusText;
            if (err.response.data?.errors[0]?.detail) {
              msg = err.response.data?.errors[0]?.detail;
            }

            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Your image could not be created',
                description: 'Status code ' + err.response.status + ': ' + msg,
              })
            );
          });
      },
    },
  },
});

export { enhancedApi as imageBuilderApi };
