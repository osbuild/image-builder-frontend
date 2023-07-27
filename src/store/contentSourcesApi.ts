import { emptyContentSourcesApi as api } from "./emptyContentSourcesApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listRepositories: build.query<
      ListRepositoriesApiResponse,
      ListRepositoriesApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/`,
        params: {
          offset: queryArg.offset,
          limit: queryArg.limit,
          version: queryArg.version,
          arch: queryArg.arch,
          available_for_version: queryArg.availableForVersion,
          available_for_arch: queryArg.availableForArch,
          search: queryArg.search,
          name: queryArg.name,
          url: queryArg.url,
          sort_by: queryArg.sortBy,
          status: queryArg.status,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as contentSourcesApi };
export type ListRepositoriesApiResponse =
  /** status 200 OK */ ApiRepositoryCollectionResponse;
export type ListRepositoriesApiArg = {
  /** Offset into the list of results to return in the response */
  offset?: number;
  /** Limit the number of items returned */
  limit?: number;
  /** Comma separated list of architecture to optionally filter-on (e.g. 'x86_64,s390x' would return Repositories with x86_64 or s390x only) */
  version?: string;
  /** Comma separated list of versions to optionally filter-on  (e.g. '7,8' would return Repositories with versions 7 or 8 only) */
  arch?: string;
  /** Filter by compatible arch (e.g. 'x86_64' would return Repositories with the 'x86_64' arch and Repositories where arch is not set) */
  availableForVersion?: string;
  /** Filter by compatible version (e.g. 7 would return Repositories with the version 7 or where version is not set) */
  availableForArch?: string;
  /** Search term for name and url. */
  search?: string;
  /** Filter repositories by name using an exact match */
  name?: string;
  /** Filter repositories by name using an exact match */
  url?: string;
  /** Sets the sort order of the results */
  sortBy?: string;
  /** Comma separated list of statuses to optionally filter on */
  status?: string;
};
export type ApiRepositoryResponse = {
  account_id?: string;
  distribution_arch?: string;
  distribution_versions?: string[];
  failed_introspections_count?: number;
  gpg_key?: string;
  last_introspection_error?: string;
  last_introspection_time?: string;
  last_success_introspection_time?: string;
  last_update_introspection_time?: string;
  metadata_verification?: boolean;
  name?: string;
  org_id?: string;
  package_count?: number;
  snapshot?: boolean;
  status?: string;
  url?: string;
  uuid?: string;
};
export type ApiLinks = {
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
};
export type ApiResponseMetadata = {
  count?: number;
  limit?: number;
  offset?: number;
};
export type ApiRepositoryCollectionResponse = {
  data?: ApiRepositoryResponse[];
  links?: ApiLinks;
  meta?: ApiResponseMetadata;
};
export type ErrorsHandlerError = {
  detail?: string;
  status?: number;
  title?: string;
};
export type ErrorsErrorResponse = {
  errors?: ErrorsHandlerError[];
};
export const { useListRepositoriesQuery } = injectedRtkApi;
