import { onPremQueryHandler } from '@/store/api/shared';

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
      queryFn: onPremQueryHandler(async ({ queryArgs, baseQuery }) => {
        const { apiContentUnitSearchRequest: searchRequest } = queryArgs;

        if (
          !searchRequest.architecture ||
          !searchRequest.distribution ||
          !searchRequest.packages
        ) {
          return [];
        }

        const result = await baseQuery({
          url: '/search/packages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packages: searchRequest.packages,
            distribution: searchRequest.distribution,
            architecture: searchRequest.architecture,
          }),
        });

        if (result.error) {
          throw result.error;
        }

        if (!result.data) {
          return [];
        }

        const data = result.data as PackagesResponse;
        if (typeof data !== 'object') {
          throw new Error('Invalid response');
        }

        return transformPackageResponse(data.packages);
      }),
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
