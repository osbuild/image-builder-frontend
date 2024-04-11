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
          uuid: queryArg.uuid,
          sort_by: queryArg.sortBy,
          status: queryArg.status,
          origin: queryArg.origin,
          content_type: queryArg.contentType,
        },
      }),
    }),
    createRepository: build.mutation<
      CreateRepositoryApiResponse,
      CreateRepositoryApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/`,
        method: "POST",
        body: queryArg.apiRepositoryRequest,
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
    searchRpm: build.mutation<SearchRpmApiResponse, SearchRpmApiArg>({
      query: (queryArg) => ({
        url: `/rpms/names`,
        method: "POST",
        body: queryArg.apiContentUnitSearchRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as contentSourcesApi };
export type ListRepositoriesApiResponse =
  /** status 200 OK */ ApiRepositoryCollectionResponseRead;
export type ListRepositoriesApiArg = {
  /** Starting point for retrieving a subset of results. Determines how many items to skip from the beginning of the result set. Default value:`0`. */
  offset?: number;
  /** Number of items to include in response. Use it to control the number of items, particularly when dealing with large datasets. Default value: `100`. */
  limit?: number;
  /** A comma separated list of release versions to filter on. For example, `1,2` would return repositories with versions 1 or 2 only. */
  version?: string;
  /** A comma separated list of architectures or platforms for that you want to retrieve repositories. It controls responses where repositories support multiple architectures or platforms. For example, ‘x86_64,s390x' returns repositories with `x86_64` or `s390x` only. */
  arch?: string;
  /** Filter repositories by supported release version. For example, `1` returns repositories with the version `1` or where version is not set. */
  availableForVersion?: string;
  /** Filter repositories by architecture. For example, `x86_64` returns repositories with the version `x86_64` or where architecture is not set. */
  availableForArch?: string;
  /** Term to filter and retrieve items that match the specified search criteria. Search term can include name or URL. */
  search?: string;
  /** Filter repositories by name. */
  name?: string;
  /** A comma separated list of URLs to control api response. */
  url?: string;
  /** A comma separated list of uuids to control api response. */
  uuid?: string;
  /** Sort the response data based on specific repository parameters. Sort criteria can include `name`, `url`, `status`, and `package_count`. */
  sortBy?: string;
  /** A comma separated list of statuses to control api response. Statuses can include `pending`, `valid`, `invalid`. */
  status?: string;
  /** A comma separated list of origins to filter api response. Origins can include `red_hat` and `external`. */
  origin?: string;
  /** content type of a repository to filter on (rpm) */
  contentType?: string;
};
export type CreateRepositoryApiResponse =
  /** status 201 Created */ ApiRepositoryResponseRead;
export type CreateRepositoryApiArg = {
  /** request body */
  apiRepositoryRequest: ApiRepositoryRequest;
};
export type ListRepositoriesRpmsApiResponse =
  /** status 200 OK */ ApiRepositoryRpmCollectionResponse;
export type ListRepositoriesRpmsApiArg = {
  /** Repository ID. */
  uuid: string;
  /** Number of items to include in response. Use it to control the number of items, particularly when dealing with large datasets. Default value: `100`. */
  limit?: number;
  /** Starting point for retrieving a subset of results. Determines how many items to skip from the beginning of the result set. Default value:`0`. */
  offset?: number;
  /** Term to filter and retrieve items that match the specified search criteria. Search term can include name. */
  search?: string;
  /** Sort the response based on specific repository parameters. Sort criteria can include `name`, `url`, `status`, and `package_count`. */
  sortBy?: string;
};
export type SearchRpmApiResponse = /** status 200 OK */ ApiSearchRpmResponse[];
export type SearchRpmApiArg = {
  /** request body */
  apiContentUnitSearchRequest: ApiContentUnitSearchRequest;
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
  /** URL to the snapshot's content */
  url?: string;
  uuid?: string;
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
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean;
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
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean;
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
export type ApiRepositoryRequest = {
  /** Architecture to restrict client usage to */
  distribution_arch?: string;
  /** Versions to restrict client usage to */
  distribution_versions?: string[];
  /** GPG key for repository */
  gpg_key?: string;
  /** Verify packages */
  metadata_verification?: boolean;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean;
  /** Name of the remote yum repository */
  name?: string;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean;
  /** URL of the remote yum repository */
  url?: string;
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
export type ApiSearchRpmResponse = {
  /** Package name found */
  package_name?: string;
  /** Summary of the package found */
  summary?: string;
};
export type ApiContentUnitSearchRequest = {
  /** Maximum number of records to return for the search */
  limit?: number;
  /** Search string to search content unit names */
  search?: string;
  /** URLs of repositories to search */
  urls?: string[];
  /** List of RepositoryConfig UUIDs to search */
  uuids?: string[];
};
export const {
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
  useListRepositoriesRpmsQuery,
  useSearchRpmMutation,
} = injectedRtkApi;
