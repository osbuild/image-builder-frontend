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
    listTemplates: build.query<ListTemplatesApiResponse, ListTemplatesApiArg>({
      query: (queryArg) => ({
        url: `/templates/`,
        params: {
          offset: queryArg.offset,
          limit: queryArg.limit,
          version: queryArg.version,
          arch: queryArg.arch,
          name: queryArg.name,
          repository_uuids: queryArg.repositoryUuids,
          snapshot_uuids: queryArg.snapshotUuids,
          sort_by: queryArg.sortBy,
        },
      }),
    }),
    getTemplate: build.query<GetTemplateApiResponse, GetTemplateApiArg>({
      query: (queryArg) => ({ url: `/templates/${queryArg.uuid}` }),
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
export type ListTemplatesApiResponse =
  /** status 200 OK */ ApiTemplateCollectionResponseRead;
export type ListTemplatesApiArg = {
  /** Starting point for retrieving a subset of results. Determines how many items to skip from the beginning of the result set. Default value:`0`. */
  offset?: number;
  /** Number of items to include in response. Use it to control the number of items, particularly when dealing with large datasets. Default value: `100`. */
  limit?: number;
  /** Filter templates by version. */
  version?: string;
  /** Filter templates by architecture. */
  arch?: string;
  /** Filter templates by name. */
  name?: string;
  /** Filter templates by associated repositories using a comma separated list of repository UUIDs */
  repositoryUuids?: string;
  /** Filter templates by associated snapshots using a comma separated list of snapshot UUIDs */
  snapshotUuids?: string;
  /** Sort the response data based on specific parameters. Sort criteria can include `name`, `arch`, and `version`. */
  sortBy?: string;
};
export type GetTemplateApiResponse =
  /** status 200 OK */ ApiTemplateResponseRead;
export type GetTemplateApiArg = {
  /** Template ID. */
  uuid: string;
};
export type ApiFeature = {
  /** Whether the current user can access the feature */
  accessible?: boolean | undefined;
  /** Whether the feature is enabled on the running server */
  enabled?: boolean | undefined;
};
export type ApiFeatureSet = {
  [key: string]: ApiFeature;
};
export type ApiSearchPackageGroupResponse = {
  /** Description of the package group found */
  description?: string | undefined;
  /** Package group ID */
  id?: string | undefined;
  /** Name of package group found */
  package_group_name?: string | undefined;
  /** Package list of the package group found */
  package_list?: string[] | undefined;
};
export type ErrorsHandlerError = {
  /** An explanation specific to the problem */
  detail?: string | undefined;
  /** HTTP status code applicable to the error */
  status?: number | undefined;
  /** A summary of the problem */
  title?: string | undefined;
};
export type ErrorsErrorResponse = {
  errors?: ErrorsHandlerError[] | undefined;
};
export type ApiContentUnitSearchRequest = {
  /** List of names to search using an exact match */
  exact_names?: string[] | undefined;
  /** Whether to include module information */
  include_package_sources?: boolean | undefined;
  /** Maximum number of records to return for the search */
  limit?: number | undefined;
  /** Search string to search content unit names */
  search?: string | undefined;
  /** URLs of repositories to search */
  urls?: string[] | undefined;
  /** List of repository UUIDs to search */
  uuids?: string[] | undefined;
};
export type ApiSnapshotResponse = {
  /** Count of each content type */
  added_counts?:
    | {
        [key: string]: number;
      }
    | undefined;
  /** Count of each content type */
  content_counts?:
    | {
        [key: string]: number;
      }
    | undefined;
  /** Datetime the snapshot was created */
  created_at?: string | undefined;
  /** Count of each content type */
  removed_counts?:
    | {
        [key: string]: number;
      }
    | undefined;
  /** Name of repository the snapshot belongs to */
  repository_name?: string | undefined;
  /** Path to repository snapshot contents */
  repository_path?: string | undefined;
  /** UUID of the repository the snapshot belongs to */
  repository_uuid?: string | undefined;
  /** URL to the snapshot's content */
  url?: string | undefined;
  uuid?: string | undefined;
};
export type ApiTaskInfoResponse = {
  /** Timestamp of task creation */
  created_at?: string | undefined;
  /** UUIDs of parent tasks */
  dependencies?: string[] | undefined;
  /** UUIDs of child tasks */
  dependents?: string[] | undefined;
  /** Timestamp task ended running at */
  ended_at?: string | undefined;
  /** Error thrown while running task */
  error?: string | undefined;
  /** Name of the associated repository or template */
  object_name?: string | undefined;
  /** Type of the associated object, either repository or template */
  object_type?: string | undefined;
  /** UUID of the associated repository or template */
  object_uuid?: string | undefined;
  /** Organization ID of the owner */
  org_id?: string | undefined;
  /** Status of task (running, failed, completed, canceled, pending) */
  status?: string | undefined;
  /** Type of task */
  type?: string | undefined;
  /** UUID of the object */
  uuid?: string | undefined;
};
export type ApiRepositoryResponse = {
  /** Content Type (rpm) of the repository */
  content_type?: string | undefined;
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number | undefined;
  /** Number of consecutive failed snapshots */
  failed_snapshot_count?: number | undefined;
  /** The feature name this repo requires */
  feature_name?: string | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Label used to configure the yum repository on clients */
  label?: string | undefined;
  /** Error of last attempted introspection */
  last_introspection_error?: string | undefined;
  /** Status of last introspection */
  last_introspection_status?: string | undefined;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string | undefined;
  last_snapshot?: ApiSnapshotResponse | undefined;
  last_snapshot_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string | undefined;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string | undefined;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string | undefined;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string | undefined;
  /** Latest URL for the snapshot distribution */
  latest_snapshot_url?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name?: string | undefined;
  /** Origin of the repository */
  origin?: string | undefined;
  /** Number of packages last read in the repository */
  package_count?: number | undefined;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
};
export type ApiRepositoryResponseRead = {
  /** Account ID of the owner */
  account_id?: string | undefined;
  /** Content Type (rpm) of the repository */
  content_type?: string | undefined;
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number | undefined;
  /** Number of consecutive failed snapshots */
  failed_snapshot_count?: number | undefined;
  /** The feature name this repo requires */
  feature_name?: string | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Label used to configure the yum repository on clients */
  label?: string | undefined;
  /** Error of last attempted introspection */
  last_introspection_error?: string | undefined;
  /** Status of last introspection */
  last_introspection_status?: string | undefined;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string | undefined;
  last_snapshot?: ApiSnapshotResponse | undefined;
  last_snapshot_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string | undefined;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string | undefined;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string | undefined;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string | undefined;
  /** Latest URL for the snapshot distribution */
  latest_snapshot_url?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name?: string | undefined;
  /** Organization ID of the owner */
  org_id?: string | undefined;
  /** Origin of the repository */
  origin?: string | undefined;
  /** Number of packages last read in the repository */
  package_count?: number | undefined;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
  /** UUID of the object */
  uuid?: string | undefined;
};
export type ApiLinks = {
  /** Path to first page of results */
  first?: string | undefined;
  /** Path to last page of results */
  last?: string | undefined;
  /** Path to next page of results */
  next?: string | undefined;
  /** Path to previous page of results */
  prev?: string | undefined;
};
export type ApiResponseMetadata = {
  /** Total count of results */
  count?: number | undefined;
  /** Limit of results used for the request */
  limit?: number | undefined;
  /** Offset into results used for the request */
  offset?: number | undefined;
};
export type ApiRepositoryCollectionResponse = {
  /** Requested Data */
  data?: ApiRepositoryResponse[] | undefined;
  links?: ApiLinks | undefined;
  meta?: ApiResponseMetadata | undefined;
};
export type ApiRepositoryCollectionResponseRead = {
  /** Requested Data */
  data?: ApiRepositoryResponseRead[] | undefined;
  links?: ApiLinks | undefined;
  meta?: ApiResponseMetadata | undefined;
};
export type ApiRepositoryRequest = {
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name: string;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
};
export type ApiRepositoryRequestRead = {
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name: string;
  /** Origin of the repository */
  origin?: string | undefined;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
};
export type ApiRepositoryImportResponse = {
  /** Content Type (rpm) of the repository */
  content_type?: string | undefined;
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number | undefined;
  /** Number of consecutive failed snapshots */
  failed_snapshot_count?: number | undefined;
  /** The feature name this repo requires */
  feature_name?: string | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Label used to configure the yum repository on clients */
  label?: string | undefined;
  /** Error of last attempted introspection */
  last_introspection_error?: string | undefined;
  /** Status of last introspection */
  last_introspection_status?: string | undefined;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string | undefined;
  last_snapshot?: ApiSnapshotResponse | undefined;
  last_snapshot_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string | undefined;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string | undefined;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string | undefined;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string | undefined;
  /** Latest URL for the snapshot distribution */
  latest_snapshot_url?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name?: string | undefined;
  /** Origin of the repository */
  origin?: string | undefined;
  /** Number of packages last read in the repository */
  package_count?: number | undefined;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
  /** Warnings to alert user of mismatched fields if there is an existing repo with the same URL */
  warnings?:
    | {
        [key: string]: any;
      }[]
    | undefined;
};
export type ApiRepositoryImportResponseRead = {
  /** Account ID of the owner */
  account_id?: string | undefined;
  /** Content Type (rpm) of the repository */
  content_type?: string | undefined;
  /** Architecture to restrict client usage to */
  distribution_arch?: string | undefined;
  /** Versions to restrict client usage to */
  distribution_versions?: string[] | undefined;
  /** Number of consecutive failed introspections */
  failed_introspections_count?: number | undefined;
  /** Number of consecutive failed snapshots */
  failed_snapshot_count?: number | undefined;
  /** The feature name this repo requires */
  feature_name?: string | undefined;
  /** GPG key for repository */
  gpg_key?: string | undefined;
  /** Label used to configure the yum repository on clients */
  label?: string | undefined;
  /** Error of last attempted introspection */
  last_introspection_error?: string | undefined;
  /** Status of last introspection */
  last_introspection_status?: string | undefined;
  /** Timestamp of last attempted introspection */
  last_introspection_time?: string | undefined;
  last_snapshot?: ApiSnapshotResponse | undefined;
  last_snapshot_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last snapshot task */
  last_snapshot_task_uuid?: string | undefined;
  /** UUID of the last dao.Snapshot */
  last_snapshot_uuid?: string | undefined;
  /** Timestamp of last successful introspection */
  last_success_introspection_time?: string | undefined;
  /** Timestamp of last introspection that had updates */
  last_update_introspection_time?: string | undefined;
  /** Latest URL for the snapshot distribution */
  latest_snapshot_url?: string | undefined;
  /** Verify packages */
  metadata_verification?: boolean | undefined;
  /** Disable modularity filtering on this repository */
  module_hotfixes?: boolean | undefined;
  /** Name of the remote yum repository */
  name?: string | undefined;
  /** Organization ID of the owner */
  org_id?: string | undefined;
  /** Origin of the repository */
  origin?: string | undefined;
  /** Number of packages last read in the repository */
  package_count?: number | undefined;
  /** Enable snapshotting and hosting of this repository */
  snapshot?: boolean | undefined;
  /** Combined status of last introspection and snapshot of repository (Valid, Invalid, Unavailable, Pending) */
  status?: string | undefined;
  /** URL of the remote yum repository */
  url?: string | undefined;
  /** UUID of the object */
  uuid?: string | undefined;
  /** Warnings to alert user of mismatched fields if there is an existing repo with the same URL */
  warnings?:
    | {
        [key: string]: any;
      }[]
    | undefined;
};
export type ApiRepositoryRpm = {
  /** The architecture of the rpm */
  arch?: string | undefined;
  /** The checksum of the rpm */
  checksum?: string | undefined;
  /** The epoch of the rpm */
  epoch?: number | undefined;
  /** The rpm package name */
  name?: string | undefined;
  /** The release of the rpm */
  release?: string | undefined;
  /** The summary of the rpm */
  summary?: string | undefined;
  /** Identifier of the rpm */
  uuid?: string | undefined;
  /** The version of the  rpm */
  version?: string | undefined;
};
export type ApiRepositoryRpmCollectionResponse = {
  /** List of rpms */
  data?: ApiRepositoryRpm[] | undefined;
  links?: ApiLinks | undefined;
  meta?: ApiResponseMetadata | undefined;
};
export type ApiPackageSourcesResponse = {
  /** Architecture of the module */
  arch?: string | undefined;
  /** Context of the module */
  context?: string | undefined;
  /** Description of the module */
  description?: string | undefined;
  /** End date of the lifecycle */
  end_date?: string | undefined;
  /** Name of the module */
  name?: string | undefined;
  /** Start date of the lifecycle */
  start_date?: string | undefined;
  /** Stream of the module */
  stream?: string | undefined;
  /** Type of rpm (can be either 'package' or 'module') */
  type?: string | undefined;
  /** Version of the module */
  version?: string | undefined;
};
export type ApiSearchRpmResponse = {
  /** Package name found */
  package_name?: string | undefined;
  /** List of the module streams for the package */
  package_sources?: ApiPackageSourcesResponse[] | undefined;
  /** Summary of the package found */
  summary?: string | undefined;
};
export type ApiSnapshotForDate = {
  /** Is the snapshot after the specified date */
  is_after?: boolean | undefined;
  match?: ApiSnapshotResponse | undefined;
  /** Repository uuid for associated snapshot */
  repository_uuid?: string | undefined;
};
export type ApiListSnapshotByDateResponse = {
  /** Requested Data */
  data?: ApiSnapshotForDate[] | undefined;
};
export type ApiListSnapshotByDateRequest = {
  /** Exact date to search by. */
  date: string;
  /** Repository UUIDs to find snapshots for */
  repository_uuids: string[];
};
export type ApiTemplateResponse = {
  /** Architecture of the template */
  arch?: string | undefined;
  /** Datetime template was created */
  created_at?: string | undefined;
  /** User that created the template */
  created_by?: string | undefined;
  /** Latest date to include snapshots for */
  date?: string | undefined;
  /** Description of the template */
  description?: string | undefined;
  /** Error of last update_latest_snapshot task that updated the template */
  last_update_snapshot_error?: string | undefined;
  last_update_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last update_template_content task that updated the template */
  last_update_task_uuid?: string | undefined;
  /** User that most recently updated the template */
  last_updated_by?: string | undefined;
  /** Name of the template */
  name?: string | undefined;
  /** Organization ID of the owner */
  org_id?: string | undefined;
  /** Repositories added to the template */
  repository_uuids?: string[] | undefined;
  /** Environment ID used by subscription-manager and candlepin */
  rhsm_environment_id?: string | undefined;
  /** Datetime template was last updated */
  updated_at?: string | undefined;
  /** Use latest snapshot for all repositories in the template */
  use_latest?: boolean | undefined;
  /** Version of the template */
  version?: string | undefined;
};
export type ApiTemplateResponseRead = {
  /** Architecture of the template */
  arch?: string | undefined;
  /** Datetime template was created */
  created_at?: string | undefined;
  /** User that created the template */
  created_by?: string | undefined;
  /** Latest date to include snapshots for */
  date?: string | undefined;
  /** Description of the template */
  description?: string | undefined;
  /** Error of last update_latest_snapshot task that updated the template */
  last_update_snapshot_error?: string | undefined;
  last_update_task?: ApiTaskInfoResponse | undefined;
  /** UUID of the last update_template_content task that updated the template */
  last_update_task_uuid?: string | undefined;
  /** User that most recently updated the template */
  last_updated_by?: string | undefined;
  /** Name of the template */
  name?: string | undefined;
  /** Organization ID of the owner */
  org_id?: string | undefined;
  /** Repositories added to the template */
  repository_uuids?: string[] | undefined;
  /** Whether the candlepin environment is created and systems can be added */
  rhsm_environment_created?: boolean | undefined;
  /** Environment ID used by subscription-manager and candlepin */
  rhsm_environment_id?: string | undefined;
  /** The list of snapshots in use by the template */
  snapshots?: ApiSnapshotResponse[] | undefined;
  /** List of snapshots used by this template which are going to be deleted soon */
  to_be_deleted_snapshots?: ApiSnapshotResponse[] | undefined;
  /** Datetime template was last updated */
  updated_at?: string | undefined;
  /** Use latest snapshot for all repositories in the template */
  use_latest?: boolean | undefined;
  uuid?: string | undefined;
  /** Version of the template */
  version?: string | undefined;
};
export type ApiTemplateCollectionResponse = {
  /** Requested Data */
  data?: ApiTemplateResponse[] | undefined;
  links?: ApiLinks | undefined;
  meta?: ApiResponseMetadata | undefined;
};
export type ApiTemplateCollectionResponseRead = {
  /** Requested Data */
  data?: ApiTemplateResponseRead[] | undefined;
  links?: ApiLinks | undefined;
  meta?: ApiResponseMetadata | undefined;
};
export const {
  useListFeaturesQuery,
  useSearchPackageGroupMutation,
  useListRepositoriesQuery,
  useCreateRepositoryMutation,
  useBulkImportRepositoriesMutation,
  useListRepositoriesRpmsQuery,
  useSearchRpmMutation,
  useListSnapshotsByDateMutation,
  useListTemplatesQuery,
  useGetTemplateQuery,
} = injectedRtkApi;
