import { emptyContentSourcesApi } from './emptyContentSourcesApi';
import { transformPackageResponse } from './helpers';
import type { Package, SearchRpmApiArg } from './types';

import type {
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
  SearchRpmApiResponse,
} from '../hosted/contentSourcesApi';

type PackagesResponse = {
  packages?: Package[];
};

export const contentSourcesApi = emptyContentSourcesApi.injectEndpoints({
  endpoints: (builder) => ({
    searchRpm: builder.mutation<SearchRpmApiResponse, SearchRpmApiArg>({
      queryFn: async (queryArgs, _, __, baseQuery) => {
        const { architecture, distribution, packages } =
          queryArgs.apiContentUnitSearchRequest;

        if (!architecture || !distribution || !packages) {
          return { data: [] };
        }

        const body = {
          packages,
          distribution,
          architecture,
        };

        const result = await baseQuery({
          url: '/search/packages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (result.error) {
          return { error: result.error };
        }

        if (!result.data) {
          return { data: [] };
        }

        const data = result.data as PackagesResponse;
        if (typeof data !== 'object') {
          return {
            error: {
              message: 'Invalid response',
              body: {
                details:
                  'Expected a packages response object but received malformed data',
              },
            },
          };
        }

        return {
          data: transformPackageResponse(data.packages),
        };
      },
    }),
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
  // since we are inheriting some endpoints,
  // we want to make sure that we don't override
  // any existing endpoints.
  overrideExisting: 'throw',
});

export const { useSearchRpmMutation, useListSnapshotsByDateMutation } =
  contentSourcesApi;
