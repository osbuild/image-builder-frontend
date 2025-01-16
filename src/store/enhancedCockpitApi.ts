import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

import { cockpitApi } from './cockpitApi';
import { errorMessage } from './enhancedImageBuilderApi';

const enhancedApi = cockpitApi.enhanceEndpoints({
  addTagTypes: ['Blueprints'],
  endpoints: {
    getBlueprints: {
      providesTags: () => {
        return [{ type: 'Blueprints' }];
      },
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
  },
});

export { enhancedApi as cockpitApi };
