import { emptyCockpitApi } from './emptyCockpitApi';
import type { Package, SearchRpmApiArg } from './types';

import type {
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

        const mappedPackages = result.data.packages?.map(
          ({ name, summary, version, release, arch }: Package) => ({
            package_name: name,
            summary: `${summary} (${version}-${release}.${arch})`,
          })
        ) ?? [];

        const deduplicatedPackages = new Set<string>();
        const resultPackages = mappedPackages.filter((pkg: {package_name: string, summary: string}) => {
          if (deduplicatedPackages.has(pkg.package_name)) {
            return false;
          }
          deduplicatedPackages.add(pkg.package_name);
          return true;
        });

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
  }),
  overrideExisting: false,
});

export const { useSearchRpmMutation, useListSnapshotsByDateMutation } =
  contentSourcesApi;
