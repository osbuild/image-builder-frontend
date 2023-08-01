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
      invalidatesTags: (_request, _error, arg) => {
        return [{ type: 'Clone', id: arg.composeId }];
      },
    },
    composeImage: {
      invalidatesTags: () => {
        return [{ type: 'Compose' }];
      },
    },
  },
});

export { enhancedApi as imageBuilderApi };
