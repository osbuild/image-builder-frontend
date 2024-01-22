import { emptyImageBuilderApi as api } from "./emptyImageBuilderApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getArchitectures: build.query<
      GetArchitecturesApiResponse,
      GetArchitecturesApiArg
    >({
      query: (queryArg) => ({ url: `/architectures/${queryArg.distribution}` }),
    }),
    getComposes: build.query<GetComposesApiResponse, GetComposesApiArg>({
      query: (queryArg) => ({
        url: `/composes`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          ignoreImageTypes: queryArg.ignoreImageTypes,
        },
      }),
    }),
    getComposeStatus: build.query<
      GetComposeStatusApiResponse,
      GetComposeStatusApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.composeId}` }),
    }),
    cloneCompose: build.mutation<CloneComposeApiResponse, CloneComposeApiArg>({
      query: (queryArg) => ({
        url: `/composes/${queryArg.composeId}/clone`,
        method: "POST",
        body: queryArg.cloneRequest,
      }),
    }),
    getComposeClones: build.query<
      GetComposeClonesApiResponse,
      GetComposeClonesApiArg
    >({
      query: (queryArg) => ({
        url: `/composes/${queryArg.composeId}/clones`,
        params: { limit: queryArg.limit, offset: queryArg.offset },
      }),
    }),
    getCloneStatus: build.query<
      GetCloneStatusApiResponse,
      GetCloneStatusApiArg
    >({
      query: (queryArg) => ({ url: `/clones/${queryArg.id}` }),
    }),
    composeImage: build.mutation<ComposeImageApiResponse, ComposeImageApiArg>({
      query: (queryArg) => ({
        url: `/compose`,
        method: "POST",
        body: queryArg.composeRequest,
      }),
    }),
    getPackages: build.query<GetPackagesApiResponse, GetPackagesApiArg>({
      query: (queryArg) => ({
        url: `/packages`,
        params: {
          distribution: queryArg.distribution,
          architecture: queryArg.architecture,
          search: queryArg.search,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    getOscapProfiles: build.query<
      GetOscapProfilesApiResponse,
      GetOscapProfilesApiArg
    >({
      query: (queryArg) => ({
        url: `/oscap/${queryArg.distribution}/profiles`,
      }),
    }),
    getOscapCustomizations: build.query<
      GetOscapCustomizationsApiResponse,
      GetOscapCustomizationsApiArg
    >({
      query: (queryArg) => ({
        url: `/oscap/${queryArg.distribution}/${queryArg.profile}/customizations`,
      }),
    }),
    getBlueprints: build.query<GetBlueprintsApiResponse, GetBlueprintsApiArg>({
      query: (queryArg) => ({
        url: `/experimental/blueprints`,
        params: {
          search: queryArg.search,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    createBlueprint: build.mutation<
      CreateBlueprintApiResponse,
      CreateBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/blueprints`,
        method: "POST",
        body: queryArg.createBlueprintRequest,
      }),
    }),
    updateBlueprint: build.mutation<
      UpdateBlueprintApiResponse,
      UpdateBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/blueprints/${queryArg.id}`,
        method: "PUT",
        body: queryArg.createBlueprintRequest,
      }),
    }),
    composeBlueprint: build.mutation<
      ComposeBlueprintApiResponse,
      ComposeBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/blueprints/${queryArg.id}/compose`,
        method: "POST",
      }),
    }),
    getBlueprintComposes: build.query<
      GetBlueprintComposesApiResponse,
      GetBlueprintComposesApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/blueprints/${queryArg.id}/composes`,
        params: {
          blueprint_version: queryArg.blueprintVersion,
          limit: queryArg.limit,
          offset: queryArg.offset,
          ignoreImageTypes: queryArg.ignoreImageTypes,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as imageBuilderApi };
export type GetArchitecturesApiResponse =
  /** status 200 a list of available architectures and their associated image types */ Architectures;
export type GetArchitecturesApiArg = {
  /** distribution for which to look up available architectures */
  distribution: Distributions;
};
export type GetComposesApiResponse =
  /** status 200 a list of composes */ ComposesResponse;
export type GetComposesApiArg = {
  /** max amount of composes, default 100 */
  limit?: number;
  /** composes page offset, default 0 */
  offset?: number;
  /** Filter the composes on image type. The filter is optional and can be specified multiple times.
   */
  ignoreImageTypes?: ImageTypes[];
};
export type GetComposeStatusApiResponse =
  /** status 200 compose status */ ComposeStatus;
export type GetComposeStatusApiArg = {
  /** Id of compose */
  composeId: string;
};
export type CloneComposeApiResponse =
  /** status 201 cloning has started */ CloneResponse;
export type CloneComposeApiArg = {
  /** Id of compose to clone */
  composeId: string;
  /** details of the new clone */
  cloneRequest: CloneRequest;
};
export type GetComposeClonesApiResponse =
  /** status 200 compose clones */ ClonesResponse;
export type GetComposeClonesApiArg = {
  /** Id of compose to get the clones of */
  composeId: string;
  /** max amount of clones, default 100 */
  limit?: number;
  /** clones page offset, default 0 */
  offset?: number;
};
export type GetCloneStatusApiResponse =
  /** status 200 clone status */ CloneStatusResponse;
export type GetCloneStatusApiArg = {
  /** Id of clone status to get */
  id: string;
};
export type ComposeImageApiResponse =
  /** status 201 compose has started */ ComposeResponse;
export type ComposeImageApiArg = {
  /** details of image to be composed */
  composeRequest: ComposeRequest;
};
export type GetPackagesApiResponse =
  /** status 200 a list of packages */ PackagesResponse;
export type GetPackagesApiArg = {
  /** distribution to look up packages for */
  distribution: Distributions;
  /** architecture to look up packages for */
  architecture: "x86_64" | "aarch64";
  /** packages to look for */
  search: string;
  /** max amount of packages, default 100 */
  limit?: number;
  /** packages page offset, default 0 */
  offset?: number;
};
export type GetOscapProfilesApiResponse =
  /** status 200 A list of profiles configurable for this distribution.
   */ DistributionProfileResponse;
export type GetOscapProfilesApiArg = {
  distribution: Distributions;
};
export type GetOscapCustomizationsApiResponse =
  /** status 200 A customizations array updated with the needed elements.
   */ Customizations;
export type GetOscapCustomizationsApiArg = {
  distribution: Distributions;
  /** Name of the profile to retrieve customizations from */
  profile: DistributionProfileItem;
};
export type GetBlueprintsApiResponse =
  /** status 200 a list of blueprints */ BlueprintsResponse;
export type GetBlueprintsApiArg = {
  /** search for blueprints by name or description */
  search?: string;
  /** max amount of blueprints, default 100 */
  limit?: number;
  /** blueprint page offset, default 0 */
  offset?: number;
};
export type CreateBlueprintApiResponse =
  /** status 201 blueprint was saved */ CreateBlueprintResponse;
export type CreateBlueprintApiArg = {
  /** details of blueprint */
  createBlueprintRequest: CreateBlueprintRequest;
};
export type UpdateBlueprintApiResponse =
  /** status 200 blueprint was updated */ CreateBlueprintResponse;
export type UpdateBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
  /** details of blueprint */
  createBlueprintRequest: CreateBlueprintRequest;
};
export type ComposeBlueprintApiResponse =
  /** status 201 compose was created */ ComposeResponse[];
export type ComposeBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
};
export type GetBlueprintComposesApiResponse =
  /** status 200 a list of composes */ ComposesResponse;
export type GetBlueprintComposesApiArg = {
  /** UUID of a blueprint */
  id: string;
  /** Filter by a specific version of the Blueprint we want to fetch composes for
   */
  blueprintVersion?: number;
  /** max amount of composes, default 100 */
  limit?: number;
  /** composes page offset, default 0 */
  offset?: number;
  /** Filter the composes on image type. The filter is optional and can be specified multiple times.
   */
  ignoreImageTypes?: ImageTypes[];
};
export type Repository = {
  rhsm: boolean;
  baseurl?: string;
  mirrorlist?: string;
  metalink?: string;
  gpgkey?: string;
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  ignore_ssl?: boolean;
  module_hotfixes?: boolean;
};
export type ArchitectureItem = {
  arch: string;
  image_types: string[];
  repositories: Repository[];
};
export type Architectures = ArchitectureItem[];
export type HttpError = {
  title: string;
  detail: string;
};
export type HttpErrorList = {
  errors: HttpError[];
};
export type Distributions =
  | "rhel-8"
  | "rhel-8-nightly"
  | "rhel-84"
  | "rhel-85"
  | "rhel-86"
  | "rhel-87"
  | "rhel-88"
  | "rhel-89"
  | "rhel-9"
  | "rhel-9-nightly"
  | "rhel-90"
  | "rhel-91"
  | "rhel-92"
  | "rhel-93"
  | "centos-8"
  | "centos-9"
  | "fedora-37"
  | "fedora-38"
  | "fedora-39"
  | "fedora-40";
export type ClientId = "api" | "ui";
export type ImageTypes =
  | "aws"
  | "azure"
  | "edge-commit"
  | "edge-installer"
  | "gcp"
  | "guest-image"
  | "image-installer"
  | "oci"
  | "vsphere"
  | "vsphere-ova"
  | "wsl"
  | "ami"
  | "rhel-edge-commit"
  | "rhel-edge-installer"
  | "vhd";
export type UploadTypes =
  | "aws"
  | "gcp"
  | "azure"
  | "aws.s3"
  | "oci.objectstorage";
export type AwsUploadRequestOptions = {
  share_with_accounts?: string[];
  share_with_sources?: string[];
};
export type Awss3UploadRequestOptions = object;
export type GcpUploadRequestOptions = {
  share_with_accounts?: string[];
};
export type AzureUploadRequestOptions = {
  source_id?: string;
  tenant_id?: string;
  subscription_id?: string;
  resource_group: string;
  image_name?: string;
};
export type OciUploadRequestOptions = object;
export type UploadRequest = {
  type: UploadTypes;
  options:
    | AwsUploadRequestOptions
    | Awss3UploadRequestOptions
    | GcpUploadRequestOptions
    | AzureUploadRequestOptions
    | OciUploadRequestOptions;
};
export type OsTree = {
  url?: string;
  contenturl?: string;
  ref?: string;
  parent?: string;
  rhsm?: boolean;
};
export type ImageRequest = {
  architecture: "x86_64" | "aarch64";
  image_type: ImageTypes;
  upload_request: UploadRequest;
  ostree?: OsTree;
  size?: any;
};
export type Container = {
  source: string;
  name?: string;
  tls_verify?: boolean;
};
export type Directory = {
  path: string;
  mode?: string;
  user?: string | number;
  group?: string | number;
  ensure_parents?: boolean;
};
export type File = {
  path: string;
  mode?: string;
  user?: string | number;
  group?: string | number;
  data?: string;
  ensure_parents?: boolean;
};
export type Subscription = {
  organization: number;
  "activation-key": string;
  "server-url": string;
  "base-url": string;
  insights: boolean;
  rhc?: boolean;
};
export type CustomRepository = {
  id: string;
  name?: string;
  filename?: string;
  baseurl?: string[];
  mirrorlist?: string;
  metalink?: string;
  gpgkey?: string[];
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  enabled?: boolean;
  priority?: number;
  ssl_verify?: boolean;
  module_hotfixes?: boolean;
};
export type OpenScap = {
  profile_id: string;
  profile_name?: string;
  profile_description?: string;
};
export type Filesystem = {
  mountpoint: string;
  min_size: any;
};
export type User = {
  name: string;
  ssh_key: string;
};
export type Services = {
  enabled?: string[];
  disabled?: string[];
};
export type Kernel = {
  name?: string;
  append?: string;
};
export type Group = {
  name: string;
  gid?: number;
};
export type Timezone = {
  timezone?: string;
  ntpservers?: string[];
};
export type Locale = {
  languages?: string[];
  keyboard?: string;
};
export type FirewallCustomization = {
  ports?: string[];
  services?: {
    enabled?: string[];
    disabled?: string[];
  };
};
export type Fdo = {
  manufacturing_server_url?: string;
  diun_pub_key_insecure?: string;
  diun_pub_key_hash?: string;
  diun_pub_key_root_certs?: string;
};
export type IgnitionEmbedded = {
  config: string;
};
export type IgnitionFirstboot = {
  url: string;
};
export type Ignition = {
  embedded?: IgnitionEmbedded;
  firstboot?: IgnitionFirstboot;
};
export type Fips = {
  enabled?: boolean;
};
export type Customizations = {
  containers?: Container[];
  directories?: Directory[];
  files?: File[];
  subscription?: Subscription;
  packages?: string[];
  payload_repositories?: Repository[];
  custom_repositories?: CustomRepository[];
  openscap?: OpenScap;
  filesystem?: Filesystem[];
  users?: User[];
  services?: Services;
  hostname?: string;
  kernel?: Kernel;
  groups?: Group[];
  timezone?: Timezone;
  locale?: Locale;
  firewall?: FirewallCustomization;
  installation_device?: string;
  fdo?: Fdo;
  ignition?: Ignition;
  partitioning_mode?: "raw" | "lvm" | "auto-lvm";
  fips?: Fips;
};
export type ComposeRequest = {
  distribution: Distributions;
  image_name?: string;
  image_description?: string;
  client_id?: ClientId;
  image_requests: ImageRequest[];
  customizations?: Customizations;
};
export type ComposesResponseItem = {
  id: string;
  request: ComposeRequest;
  created_at: string;
  image_name?: string;
  client_id?: ClientId;
  blueprint_id?: string | null;
  blueprint_version?: number | null;
};
export type ComposesResponse = {
  meta: {
    count: number;
  };
  links: {
    first: string;
    last: string;
  };
  data: ComposesResponseItem[];
};
export type AwsUploadStatus = {
  ami: string;
  region: string;
};
export type Awss3UploadStatus = {
  url: string;
};
export type GcpUploadStatus = {
  project_id: string;
  image_name: string;
};
export type AzureUploadStatus = {
  image_name: string;
};
export type OciUploadStatus = {
  url: string;
};
export type UploadStatus = {
  status: "success" | "failure" | "pending" | "running";
  type: UploadTypes;
  options:
    | AwsUploadStatus
    | Awss3UploadStatus
    | GcpUploadStatus
    | AzureUploadStatus
    | OciUploadStatus;
};
export type ComposeStatusError = {
  id: number;
  reason: string;
  details?: any;
};
export type ImageStatus = {
  status:
    | "success"
    | "failure"
    | "pending"
    | "building"
    | "uploading"
    | "registering";
  upload_status?: UploadStatus;
  error?: ComposeStatusError;
};
export type ComposeStatus = {
  image_status: ImageStatus;
  request: ComposeRequest;
};
export type CloneResponse = {
  id: string;
};
export type Awsec2Clone = {
  region: string;
  share_with_accounts?: string[];
  share_with_sources?: string[];
};
export type CloneRequest = Awsec2Clone;
export type ClonesResponseItem = {
  id: string;
  compose_id: string;
  request: CloneRequest;
  created_at: string;
};
export type ClonesResponse = {
  meta: {
    count: number;
  };
  links: {
    first: string;
    last: string;
  };
  data: ClonesResponseItem[];
};
export type CloneStatusResponse = {
  compose_id?: string;
} & UploadStatus;
export type ComposeResponse = {
  id: string;
};
export type Package = {
  name: string;
  summary: string;
};
export type PackagesResponse = {
  meta: {
    count: number;
  };
  links: {
    first: string;
    last: string;
  };
  data: Package[];
};
export type DistributionProfileItem =
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_enhanced"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_high"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_intermediary"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_minimal"
  | "xccdf_org.ssgproject.content_profile_cis"
  | "xccdf_org.ssgproject.content_profile_cis_server_l1"
  | "xccdf_org.ssgproject.content_profile_cis_workstation_l1"
  | "xccdf_org.ssgproject.content_profile_cis_workstation_l2"
  | "xccdf_org.ssgproject.content_profile_cui"
  | "xccdf_org.ssgproject.content_profile_e8"
  | "xccdf_org.ssgproject.content_profile_hipaa"
  | "xccdf_org.ssgproject.content_profile_ism_o"
  | "xccdf_org.ssgproject.content_profile_ospp"
  | "xccdf_org.ssgproject.content_profile_pci-dss"
  | "xccdf_org.ssgproject.content_profile_standard"
  | "xccdf_org.ssgproject.content_profile_stig"
  | "xccdf_org.ssgproject.content_profile_stig_gui";
export type DistributionProfileResponse = DistributionProfileItem[];
export type BlueprintItem = {
  id: string;
  version: number;
  name: string;
  description: string;
  last_modified_at: string;
};
export type BlueprintsResponse = {
  meta: {
    count: number;
  };
  links: {
    first: string;
    last: string;
  };
  data: BlueprintItem[];
};
export type CreateBlueprintResponse = {
  id: string;
};
export type CreateBlueprintRequest = {
  name: string;
  description: string;
  distribution: Distributions;
  image_requests: ImageRequest[];
  customizations: Customizations;
};
export const {
  useGetArchitecturesQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useCloneComposeMutation,
  useGetComposeClonesQuery,
  useGetCloneStatusQuery,
  useComposeImageMutation,
  useGetPackagesQuery,
  useGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useComposeBlueprintMutation,
  useGetBlueprintComposesQuery,
} = injectedRtkApi;
