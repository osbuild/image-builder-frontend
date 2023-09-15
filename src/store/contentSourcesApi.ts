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
          origin: queryArg.origin,
          content_type: queryArg.contentType,
        },
      }),
    }),
    listRepositoriesRpms: build.query<
      ListRepositoriesRpmsApiResponse,
      ListRepositoriesRpmsApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/${queryArg.uuid}/rpms`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          sort_by: queryArg.sortBy,
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
  /** Comma separated list of origins to filter (red_hat,external) */
  origin?: string;
  /** content type of a repository to filter on (rpm) */
  contentType?: string;
};
export type ListRepositoriesRpmsApiResponse =
  /** status 200 OK */ ApiRepositoryRpmCollectionResponse;
export type ListRepositoriesRpmsApiArg = {
  /** Identifier of the Repository */
  uuid: string;
  /** Limit the number of items returned */
  limit?: number;
  /** Offset into the list of results to return in the response */
  offset?: number;
  /** Search term for name. */
  search?: string;
  /** Sets the sort order of the results. */
  sortBy?: string;
};
export type ApiSnapshotResponse = {
  added_counts?: {
    [key: string]: number;
  };
  content_counts?: {
    [key: string]: number;
  };
  created_at?: string;
  removed_counts?: {
    [key: string]: number;
  };
  repository_path?: string;
};
export type ApiRepositoryResponse = {
  account_id?: string;
  content_type?: string;
  distribution_arch?: string;
  distribution_versions?: string[];
  failed_introspections_count?: number;
  gpg_key?: string;
  last_introspection_error?: string;
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  last_snapshot_task_uuid?: string;
  last_snapshot_uuid?: string;
  last_success_introspection_time?: string;
  last_update_introspection_time?: string;
  metadata_verification?: boolean;
  name?: string;
  org_id?: string;
  origin?: string;
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
export type ApiRepositoryRpm = {
  arch?: string;
  checksum?: string;
  epoch?: number;
  name?: string;
  release?: string;
  summary?: string;
  uuid?: string;
  version?: string;
};
export type ApiRepositoryRpmCollectionResponse = {
  data?: ApiRepositoryRpm[];
  links?: ApiLinks;
  meta?: ApiResponseMetadata;
};
export const { useListRepositoriesQuery, useListRepositoriesRpmsQuery } =
  injectedRtkApi;
