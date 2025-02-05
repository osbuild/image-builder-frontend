import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { cockpitApi } from './cockpitApi';

const enhancedApi = cockpitApi.enhanceEndpoints({
  addTagTypes: ['Blueprints', 'Composes'],
  endpoints: {
    getBlueprints: {
      providesTags: () => {
        return [{ type: 'Blueprints' }];
      },
    },
    createBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled
          .then(() => {
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Blueprint was created',
              })
            );
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Unable to create blueprint',
                description: `Error: ${JSON.stringify(err)}`,
              })
            );
          });
      },
    },
    updateBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled
          .then(() => {
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Blueprint was created',
              })
            );
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Unable to update blueprint',
                description: `Error: ${JSON.stringify(err)}`,
              })
            );
          });
      },
    },
    deleteBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }, { type: 'Composes' }],
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
                description: `Error: ${JSON.stringify(err)}`,
              })
            );
          });
      },
    },
    composeBlueprint: {
      invalidatesTags: [{ type: 'Composes' }],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        queryFulfilled
          .then(() => {
            dispatch(
              addNotification({
                variant: 'success',
                title: 'Build was queued',
              })
            );
          })
          .catch((err) => {
            dispatch(
              addNotification({
                variant: 'danger',
                title: 'Unable to build blueprint',
                // If details are present, assume it's coming from composer
                description: err.error?.body?.details
                  ? `${err.error.message}: ${err.error.body.details}`
                  : `Error: ${JSON.stringify(err)}`,
              })
            );
          });
      },
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
