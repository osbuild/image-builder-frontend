import { isDefined, onPremQueryHandler } from '@/store/api/shared';

import { emptyContentSourcesApi } from './emptyContentSourcesApi';
import { transformPackageResponse } from './helpers';
import { assertPackagesResponse } from './typeguards';
import type { SearchRpmApiArg } from './types';

import type {
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
  SearchRpmApiResponse,
} from '../hosted/contentSourcesApi';

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

        if (!isDefined(result.data)) {
          return [];
        }

        const { packages } = assertPackagesResponse(result.data);
        return transformPackageResponse(packages);
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
