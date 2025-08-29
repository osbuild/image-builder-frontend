import { emptyCockpitApi } from './emptyCockpitApi';
import type { Package, SearchRpmApiArg } from './types';

import type {
  ApiRepositoryRequest,
  CreateRepositoryApiArg,
  CreateRepositoryApiResponse,
  ListRepositoriesApiArg,
  ListRepositoriesApiResponse,
  ListSnapshotsByDateApiArg,
  ListSnapshotsByDateApiResponse,
  SearchRpmApiResponse,
} from '../service/contentSourcesApi';

export const contentSourcesApi = emptyCockpitApi.injectEndpoints({
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

        if (result?.error) {
          return { error: result.error };
        }

        const resultPackages = result.data.packages?.map(
          ({ name, summary, version, release, arch }: Package) => ({
            package_name: name,
            summary: `${summary} (${version}-${release}.${arch})`,
          })
        );

        return {
          data: resultPackages,
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
    listRepositories: builder.query<
      ListRepositoriesApiResponse,
      ListRepositoriesApiArg
    >({
      queryFn: async (queryArgs, _, __, baseQuery) => {
        const result = await baseQuery({
          url: '/repositories',
          method: 'GET',
          params: {
            limit: queryArgs.limit,
            offset: queryArgs.offset,
            search: queryArgs.search,
            origin: queryArgs.origin,
            content_type: queryArgs.contentType,
            available_for_arch: queryArgs.availableForArch,
            available_for_version: queryArgs.availableForVersion,
          },
        });

        if (result?.error) {
          return { error: result.error };
        }

        return { data: result.data };
      },
    }),
    createRepository: builder.mutation<
      CreateRepositoryApiResponse,
      CreateRepositoryApiArg
    >({
      queryFn: async (queryArgs, _, __, baseQuery) => {
        const result = await baseQuery({
          url: '/repositories',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queryArgs.apiRepositoryRequest),
        });

        if (result?.error) {
          return { error: result.error };
        }

        return { data: result.data };
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchRpmMutation,
  useListSnapshotsByDateMutation,
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
} = contentSourcesApi;
