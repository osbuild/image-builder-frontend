import { emptyContentSourcesApi as api } from "./emptyContentSourcesApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listFeatures: build.query<ListFeaturesApiResponse, ListFeaturesApiArg>({
      query: () => ({ url: `/features/` }),
    }),
    searchPackageGroup: build.mutation<
      SearchPackageGroupApiResponse,
      SearchPackageGroupApiArg
    >({
      query: (queryArg) => ({
        url: `/package_groups/names`,
        method: "POST",
        body: queryArg.apiContentUnitSearchRequest,
      }),
    }),
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
    bulkExportRepositories: build.mutation<
      BulkExportRepositoriesApiResponse,
      BulkExportRepositoriesApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/bulk_export/`,
        method: "POST",
        body: queryArg.apiRepositoryExportRequest,
      }),
    }),
    bulkImportRepositories: build.mutation<
      BulkImportRepositoriesApiResponse,
      BulkImportRepositoriesApiArg
    >({
      query: (queryArg) => ({
        url: `/repositories/bulk_import/`,
        method: "POST",
        body: queryArg.body,
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
    listSnapshotsByDate: build.mutation<
      ListSnapshotsByDateApiResponse,
      ListSnapshotsByDateApiArg
    >({
      query: (queryArg) => ({
        url: `/snapshots/for_date/`,
        method: "POST",
        body: queryArg.apiListSnapshotByDateRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as contentSourcesApi };
export type ListFeaturesApiResponse = /** status 200 OK */ ApiFeatureSet;
export type ListFeaturesApiArg = void;
export type SearchPackageGroupApiResponse =
  /** status 200 OK */ ApiSearchPackageGroupResponse[];
export type SearchPackageGroupApiArg = {
  /** request body */
  apiContentUnitSearchRequest: ApiContentUnitSearchRequest;
};
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
  /** A comma separated list of UUIDs to control api response. */
  uuid?: string;
  /** Sort the response data based on specific repository parameters. Sort criteria can include `name`, `url`, `status`, and `package_count`. */
  sortBy?: string;
  /** A comma separated list of statuses to control api response. Statuses can include `Pending`, `Valid`, `Invalid`, `Unavailable`. */
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
export type BulkExportRepositoriesApiResponse =
  /** status 201 Created */ ApiRepositoryExportResponse[];
export type BulkExportRepositoriesApiArg = {
  /** request body */
  apiRepositoryExportRequest: ApiRepositoryExportRequest;
};
export type BulkImportRepositoriesApiResponse =
  /** status 201 Created */ ApiRepositoryImportResponseRead[];
export type BulkImportRepositoriesApiArg = {
  /** request body */
  body: ApiRepositoryRequest[];
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
export type ListSnapshotsByDateApiResponse =
  /** status 200 OK */ ApiListSnapshotByDateResponse;
export type ListSnapshotsByDateApiArg = {
  /** request body */
  apiListSnapshotByDateRequest: ApiListSnapshotByDateRequest;
};
export type ApiFeature = {
  /** Whether the current user can access the feature */
  accessible?: boolean;
  /** Whether the feature is enabled on the running server */
  enabled?: boolean;
};
export type ApiFeatureSet = {
  [key: string]: ApiFeature;
};
export type ApiSearchPackageGroupResponse = {
  /** Description of the package group found */
  description?: string;
  /** Package group ID */
  id?: string;
  /** Name of package group found */
  package_group_name?: string;
  /** Package list of the package group found */
  package_list?: string[];
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
export type ApiContentUnitSearchRequest = {
  /** Maximum number of records to return for the search */
  limit?: number;
  /** Search string to search content unit names */
  search?: string;
  /** URLs of repositories to search */
  urls?: string[];
  /** List of repository UUIDs to search */
  uuids?: string[];
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
  /** Name of repository the snapshot belongs to */
  repository_name?: string;
  /** Path to repository snapshot contents */
  repository_path?: string;
  /** UUID of the repository the snapshot belongs to */
  repository_uuid?: string;
  /** URL to the snapshot's content */
  url?: string;
  uuid?: string;
};
export type ApiTaskInfoResponse = {
  /** Timestamp of task creation */
  created_at?: string;
  /** UUIDs of parent tasks */
  dependencies?: string[];
  /** UUIDs of child tasks */
  dependents?: string[];
  /** Timestamp task ended running at */
  ended_at?: string;
  /** Error thrown while running task */
  error?: string;
  /** Name of the associated repository or template */
  object_name?: string;
  /** Type of the associated object, either repository or template */
  object_type?: string;
  /** UUID of the associated repository or template */
  object_uuid?: string;
  /** Organization ID of the owner */
  org_id?: string;
  /** Status of task (running, failed, completed, canceled, pending) */
  status?: string;
  /** Type of task */
  type?: string;
  /** UUID of the object */
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
  /** Label used to configure the yum repository on clients */
  label?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Status of last introspection */
  last_introspection_status?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  last_snapshot_task?: ApiTaskInfoResponse;
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
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
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
  /** Label used to configure the yum repository on clients */
  label?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Status of last introspection */
  last_introspection_status?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  last_snapshot_task?: ApiTaskInfoResponse;
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
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
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
export type ApiRepositoryRequestRead = {
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
  /** Origin of the repository */
  origin?: string;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean;
  /** URL of the remote yum repository */
  url?: string;
};
export type ApiRepositoryExportResponse = {
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
  /** Origin of the repository */
  origin?: string;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean;
  /** URL of the remote yum repository */
  url?: string;
};
export type ApiRepositoryExportRequest = {
  /** List of repository uuids to export */
  repository_uuids?: string[];
};
export type ApiRepositoryImportResponse = {
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
  /** Label used to configure the yum repository on clients */
  label?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Status of last introspection */
  last_introspection_status?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  last_snapshot_task?: ApiTaskInfoResponse;
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
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string;
  /** URL of the remote yum repository */
  url?: string;
  /** Warnings to alert user of mismatched fields if there is an existing repo with the same URL */
  warnings?: {
    [key: string]: any;
  }[];
};
export type ApiRepositoryImportResponseRead = {
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
  /** Label used to configure the yum repository on clients */
  label?: string;
  /** Error of last attempted introspection */
  last_introspection_error?: string;
  /** Status of last introspection */
  last_introspection_status?: string;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string;
  last_snapshot?: ApiSnapshotResponse;
  last_snapshot_task?: ApiTaskInfoResponse;
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
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string;
  /** URL of the remote yum repository */
  url?: string;
  /** UUID of the object */
  uuid?: string;
  /** Warnings to alert user of mismatched fields if there is an existing repo with the same URL */
  warnings?: {
    [key: string]: any;
  }[];
};
export type ApiRepositoryRpm = {
  /** The architecture of the rpm */
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
export type ApiSnapshotForDate = {
  /** Is the snapshot after the specified date */
  is_after?: boolean;
  match?: ApiSnapshotResponse;
  /** Repository uuid for associated snapshot */
  repository_uuid?: string;
};
export type ApiListSnapshotByDateResponse = {
  /** Requested Data */
  data?: ApiSnapshotForDate[];
};
export type ApiListSnapshotByDateRequest = {
  /** Exact date to search by. */
  date?: string;
  /** Repository UUIDs to find snapshots for */
  repository_uuids?: string[];
};
export const {
  useListFeaturesQuery,
  useSearchPackageGroupMutation,
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
  useBulkExportRepositoriesMutation,
  useBulkImportRepositoriesMutation,
  useListRepositoriesRpmsQuery,
  useSearchRpmMutation,
  useListSnapshotsByDateMutation,
} = injectedRtkApi;
