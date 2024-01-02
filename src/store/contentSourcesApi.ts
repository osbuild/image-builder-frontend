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
  /** status 200 OK */ ApiRepositoryCollectionResponseRead;
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
  /** Count of each content type */
  added_counts?: {
    [key: string]: number;
  };
  /** Count of each content type */
  content_counts?: {
    [key: string]: number;
  };
  /** Datetime the snapshot was created */
  created_at?: string;
  /** Count of each content type */
  removed_counts?: {
    [key: string]: number;
  };
  /** Path to repository snapshot contents */
  repository_path?: string;
};
export type ApiRepositoryResponse = {
  /** Content Type (rpm) of the repository */
  content_type?: string;
  /** Architecture to restrict client usage to */
  distribution_arch?: string;
  /** Versions to restrict client usage to */
  distribution_versions?: string[];
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number;
  /** GPG key for repository */
  gpg_key?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string;
  /** Verify packages */
  metadata_verification?: boolean;
  /** Name of the remote yum repository */
  name?: string;
  /** Origin of the repository */
  origin?: string;
  /** Number of packages last read in the repository */
  package_count?: number;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean;
  /** Status of repository introspection (Valid, Invalid, Unavailable, Pending) */
  status?: string;
  /** URL of the remote yum repository */
  url?: string;
};
export type ApiRepositoryResponseRead = {
  /** Account ID of the owner */
  account_id?: string;
  /** Content Type (rpm) of the repository */
  content_type?: string;
  /** Architecture to restrict client usage to */
  distribution_arch?: string;
  /** Versions to restrict client usage to */
  distribution_versions?: string[];
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number;
  /** GPG key for repository */
  gpg_key?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string;
  /** Verify packages */
  metadata_verification?: boolean;
  /** Name of the remote yum repository */
  name?: string;
  /** Organization ID of the owner */
  org_id?: string;
  /** Origin of the repository */
  origin?: string;
  /** Number of packages last read in the repository */
  package_count?: number;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean;
  /** Status of repository introspection (Valid, Invalid, Unavailable, Pending) */
  status?: string;
  /** URL of the remote yum repository */
  url?: string;
  /** UUID of the object */
  uuid?: string;
};
export type ApiLinks = {
  /** Path to first page of results */
  first?: string;
  /** Path to last page of results */
  last?: string;
  /** Path to next page of results */
  next?: string;
  /** Path to previous page of results */
  prev?: string;
};
export type ApiResponseMetadata = {
  /** Total count of results */
  count?: number;
  /** Limit of results used for the request */
  limit?: number;
  /** Offset into results used for the request */
  offset?: number;
};
export type ApiRepositoryCollectionResponse = {
  /** Requested Data */
  data?: ApiRepositoryResponse[];
  links?: ApiLinks;
  meta?: ApiResponseMetadata;
};
export type ApiRepositoryCollectionResponseRead = {
  /** Requested Data */
  data?: ApiRepositoryResponseRead[];
  links?: ApiLinks;
  meta?: ApiResponseMetadata;
};
export type ErrorsHandlerError = {
  /** An explanation specific to the problem */
  detail?: string;
  /** HTTP status code applicable to the error */
  status?: number;
  /** A summary of the problem */
  title?: string;
};
export type ErrorsErrorResponse = {
  errors?: ErrorsHandlerError[];
};
export type ApiRepositoryRpm = {
  /** The Architecture of the rpm */
  arch?: string;
  /** The checksum of the rpm */
  checksum?: string;
  /** The epoch of the rpm */
  epoch?: number;
  /** The rpm package name */
  name?: string;
  /** The release of the rpm */
  release?: string;
  /** The summary of the rpm */
  summary?: string;
  /** Identifier of the rpm */
  uuid?: string;
  /** The version of the  rpm */
  version?: string;
};
export type ApiRepositoryRpmCollectionResponse = {
  /** List of rpms */
  data?: ApiRepositoryRpm[];
  links?: ApiLinks;
  meta?: ApiResponseMetadata;
};
export const { useListRepositoriesQuery, useListRepositoriesRpmsQuery } =
  injectedRtkApi;
