import { emptyCockpitApi } from './emptyCockpitApi';

import type {
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
} from '../service/contentSourcesApi';

export const contentSourcesApi = emptyCockpitApi.injectEndpoints({
  endpoints: (builder) => ({
    // add an empty response for now
    // just so we can step through the create
    // image wizard for on prem
    listSnapshotsByDate: builder.mutation<
      ListSnapshotsByDateApiResponse,
      ListSnapshotsByDateApiArg
    >({
      queryFn: () => ({
        data: {
          data: [],
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useListSnapshotsByDateMutation } = contentSourcesApi;
