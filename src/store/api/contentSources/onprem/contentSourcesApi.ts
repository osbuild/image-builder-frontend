import { onPremQueryHandler } from '@/store/api/shared';

import { emptyContentSourcesApi } from './emptyContentSourcesApi';
import { listPackages, transformPackageResponse } from './helpers';
import type { Package, SearchRpmApiArg } from './types';

import { parseJsonUnsafe } from '../../backend/onprem/composerApi/helpers';
import type {
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
  SearchRpmApiResponse,
} from '../hosted/contentSourcesApi';

export const contentSourcesApi = emptyContentSourcesApi.injectEndpoints({
  endpoints: (builder) => ({
    searchRpm: builder.mutation<SearchRpmApiResponse, SearchRpmApiArg>({
      queryFn: onPremQueryHandler(async ({ queryArgs }) => {
        const { apiContentUnitSearchRequest: searchRequest } = queryArgs;
        const { architecture, distribution, packages } = searchRequest;

        if (!architecture || !distribution || !packages) {
          return [];
        }

        const result = await listPackages({
          distribution,
          architecture,
          packages,
        });
        const parsed = parseJsonUnsafe<{ packages: Package[] }>(result);

        if (!Array.isArray(parsed.packages)) {
          throw new Error('Unexpected image builder search output');
        }

        return transformPackageResponse(parsed.packages);
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
