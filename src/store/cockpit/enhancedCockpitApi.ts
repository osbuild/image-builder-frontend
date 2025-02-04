import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { cockpitApi } from './cockpitApi';

import { errorMessage } from '../service/enhancedImageBuilderApi';

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
    },
    updateBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }],
    },
    deleteBlueprint: {
      invalidatesTags: [{ type: 'Blueprints' }],
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
                description: `Status code ${err.error.status}: ${errorMessage(
                  err
                )}`,
              })
            );
          });
      },
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
