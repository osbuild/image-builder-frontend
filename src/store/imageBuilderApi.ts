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
        params: { limit: queryArg.limit, offset: queryArg.offset },
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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as imageBuilderApi };
export type GetArchitecturesApiResponse =
  /** status 200 a list of available architectures and their associated image types */ Architectures;
export type GetArchitecturesApiArg = {
  /** distribution for which to look up available architectures */
  distribution: string;
};
export type GetComposesApiResponse =
  /** status 200 a list of composes */ ComposesResponse;
export type GetComposesApiArg = {
  /** max amount of composes, default 100 */
  limit?: number;
  /** composes page offset, default 0 */
  offset?: number;
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
  /** status 200 clone status */ UploadStatus;
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
export type Repository = {
  rhsm: boolean;
  baseurl?: string;
  mirrorlist?: string;
  metalink?: string;
  gpgkey?: string;
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  ignore_ssl?: boolean;
};
export type ArchitectureItem = {
  arch: string;
  image_types: string[];
  repositories: Repository[];
};
export type Architectures = ArchitectureItem[];
export type Distributions =
  | "rhel-8"
  | "rhel-8-nightly"
  | "rhel-84"
  | "rhel-85"
  | "rhel-86"
  | "rhel-87"
  | "rhel-88"
  | "rhel-9"
  | "rhel-9-nightly"
  | "rhel-90"
  | "rhel-91"
  | "rhel-92"
  | "centos-8"
  | "centos-9"
  | "fedora-37"
  | "fedora-38"
  | "fedora-39";
export type ImageTypes =
  | "aws"
  | "azure"
  | "edge-commit"
  | "edge-installer"
  | "gcp"
  | "guest-image"
  | "image-installer"
  | "vsphere"
  | "vsphere-ova"
  | "wsl"
  | "ami"
  | "rhel-edge-commit"
  | "rhel-edge-installer"
  | "vhd";
export type UploadTypes = "aws" | "gcp" | "azure" | "aws.s3";
export type AwsUploadRequestOptions = {
  share_with_accounts?: string[];
  share_with_sources?: string[];
};
export type Awss3UploadRequestOptions = object;
export type GcpUploadRequestOptions = {
  share_with_accounts: string[];
};
export type AzureUploadRequestOptions = {
  source_id?: string;
  tenant_id?: string;
  subscription_id?: string;
  resource_group: string;
  image_name?: string;
};
export type UploadRequest = {
  type: UploadTypes;
  options:
    | AwsUploadRequestOptions
    | Awss3UploadRequestOptions
    | GcpUploadRequestOptions
    | AzureUploadRequestOptions;
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
};
export type OpenScap = {
  profile_id: string;
};
export type Filesystem = {
  mountpoint: string;
  min_size: any;
};
export type User = {
  name: string;
  ssh_key: string;
};
export type Customizations = {
  subscription?: Subscription;
  packages?: string[];
  payload_repositories?: Repository[];
  custom_repositories?: CustomRepository[];
  openscap?: OpenScap;
  filesystem?: Filesystem[];
  users?: User[];
};
export type ComposeRequest = {
  distribution: Distributions;
  image_name?: string;
  image_description?: string;
  image_requests: ImageRequest[];
  customizations?: Customizations;
};
export type ComposesResponseItem = {
  id: string;
  request: ComposeRequest;
  created_at: string;
  image_name?: string;
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
export type UploadStatus = {
  status: "success" | "failure" | "pending" | "running";
  type: UploadTypes;
  options:
    | AwsUploadStatus
    | Awss3UploadStatus
    | GcpUploadStatus
    | AzureUploadStatus;
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
export type ComposeResponse = {
  id: string;
};
export type HttpError = {
  title: string;
  detail: string;
};
export type HttpErrorList = {
  errors: HttpError[];
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
export const {
  useGetArchitecturesQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useCloneComposeMutation,
  useGetComposeClonesQuery,
  useGetCloneStatusQuery,
  useComposeImageMutation,
  useGetPackagesQuery,
} = injectedRtkApi;
