import { emptyImageBuilderApi as api } from "./emptyImageBuilderApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getArchitectures: build.query<
      GetArchitecturesApiResponse,
      GetArchitecturesApiArg
    >({
      query: (queryArg) => ({ url: `/architectures/${queryArg.distribution}` }),
    }),
    getCloneStatus: build.query<
      GetCloneStatusApiResponse,
      GetCloneStatusApiArg
    >({
      query: (queryArg) => ({ url: `/clones/${queryArg.id}` }),
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
    getComposeClones: build.query<
      GetComposeClonesApiResponse,
      GetComposeClonesApiArg
    >({
      query: (queryArg) => ({
        url: `/composes/${queryArg.composeId}/clones`,
        params: { limit: queryArg.limit, offset: queryArg.offset },
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
export type GetCloneStatusApiResponse =
  /** status 200 clone status */ UploadStatus;
export type GetCloneStatusApiArg = {
  /** Id of clone status to get */
  id: string;
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
export type Repository = {
  baseurl?: string;
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  gpgkey?: string;
  ignore_ssl?: boolean;
  metalink?: string;
  mirrorlist?: string;
  rhsm: boolean;
};
export type ArchitectureItem = {
  arch: string;
  image_types: string[];
  repositories: Repository[];
};
export type Architectures = ArchitectureItem[];
export type AwsUploadStatus = {
  ami: string;
  region: string;
};
export type Awss3UploadStatus = {
  url: string;
};
export type GcpUploadStatus = {
  image_name: string;
  project_id: string;
};
export type AzureUploadStatus = {
  image_name: string;
};
export type UploadTypes = "aws" | "gcp" | "azure" | "aws.s3";
export type UploadStatus = {
  options:
    | AwsUploadStatus
    | Awss3UploadStatus
    | GcpUploadStatus
    | AzureUploadStatus;
  status: "success" | "failure" | "pending" | "running";
  type: UploadTypes;
};
export type ComposesResponseItem = {
  created_at: string;
  id: string;
  image_name?: string;
  request: any;
};
export type ComposesResponse = {
  data: ComposesResponseItem[];
  links: {
    first: string;
    last: string;
  };
  meta: {
    count: number;
  };
};
export type ComposeStatusError = {
  details?: any;
  id: number;
  reason: string;
};
export type ImageStatus = {
  error?: ComposeStatusError;
  status:
    | "success"
    | "failure"
    | "pending"
    | "building"
    | "uploading"
    | "registering";
  upload_status?: UploadStatus;
};
export type CustomRepository = {
  baseurl?: string[];
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  enabled?: boolean;
  filename?: string;
  gpgkey?: string[];
  id: string;
  metalink?: string;
  mirrorlist?: string;
  name?: string;
  priority?: number;
  ssl_verify?: boolean;
};
export type Filesystem = {
  min_size: any;
  mountpoint: string;
};
export type OpenScap = {
  profile_id: string;
};
export type Subscription = {
  "activation-key": string;
  "base-url": string;
  insights: boolean;
  organization: number;
  rhc?: boolean;
  "server-url": string;
};
export type User = {
  name: string;
  ssh_key: string;
};
export type Customizations = {
  custom_repositories?: CustomRepository[];
  filesystem?: Filesystem[];
  openscap?: OpenScap;
  packages?: string[];
  payload_repositories?: Repository[];
  subscription?: Subscription;
  users?: User[];
};
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
  | "ami"
  | "rhel-edge-commit"
  | "rhel-edge-installer"
  | "vhd";
export type OsTree = {
  contenturl?: string;
  parent?: string;
  ref?: string;
  rhsm?: boolean;
  url?: string;
};
export type AwsUploadRequestOptions = {
  share_with_accounts?: string[];
  share_with_sources?: string[];
};
export type Awss3UploadRequestOptions = object;
export type GcpUploadRequestOptions = {
  share_with_accounts: string[];
};
export type AzureUploadRequestOptions = {
  image_name?: string;
  resource_group: string;
  source_id?: string;
  subscription_id?: string;
  tenant_id?: string;
};
export type UploadRequest = {
  options:
    | AwsUploadRequestOptions
    | Awss3UploadRequestOptions
    | GcpUploadRequestOptions
    | AzureUploadRequestOptions;
  type: UploadTypes;
};
export type ImageRequest = {
  architecture: "x86_64" | "aarch64";
  image_type: ImageTypes;
  ostree?: OsTree;
  upload_request: UploadRequest;
};
export type ComposeRequest = {
  customizations?: Customizations;
  distribution: Distributions;
  image_name?: string;
  image_requests: ImageRequest[];
};
export type ComposeStatus = {
  image_status: ImageStatus;
  request: ComposeRequest;
};
export type ClonesResponseItem = {
  created_at: string;
  id: string;
  request: any;
};
export type ClonesResponse = {
  data: ClonesResponseItem[];
  links: {
    first: string;
    last: string;
  };
  meta: {
    count: number;
  };
};
export const {
  useGetArchitecturesQuery,
  useGetCloneStatusQuery,
  useGetComposesQuery,
  useGetComposeStatusQuery,
  useGetComposeClonesQuery,
} = injectedRtkApi;
