import { emptyImageBuilderApi as api } from "./emptyImageBuilderApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getArchitectures: build.query<
      GetArchitecturesApiResponse,
      GetArchitecturesApiArg
    >({
      query: (queryArg) => ({ url: `/architectures/${queryArg.distribution}` }),
    }),
    getBlueprints: build.query<GetBlueprintsApiResponse, GetBlueprintsApiArg>({
      query: (queryArg) => ({
        url: `/blueprints`,
        params: {
          name: queryArg.name,
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
        url: `/blueprints`,
        method: "POST",
        body: queryArg.createBlueprintRequest,
      }),
    }),
    updateBlueprint: build.mutation<
      UpdateBlueprintApiResponse,
      UpdateBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/blueprints/${queryArg.id}`,
        method: "PUT",
        body: queryArg.createBlueprintRequest,
      }),
    }),
    getBlueprint: build.query<GetBlueprintApiResponse, GetBlueprintApiArg>({
      query: (queryArg) => ({
        url: `/blueprints/${queryArg.id}`,
        params: {
          version: queryArg.version,
        },
      }),
    }),
    deleteBlueprint: build.mutation<
      DeleteBlueprintApiResponse,
      DeleteBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/blueprints/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    exportBlueprint: build.query<
      ExportBlueprintApiResponse,
      ExportBlueprintApiArg
    >({
      query: (queryArg) => ({ url: `/blueprints/${queryArg.id}/export` }),
    }),
    composeBlueprint: build.mutation<
      ComposeBlueprintApiResponse,
      ComposeBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/blueprints/${queryArg.id}/compose`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getBlueprintComposes: build.query<
      GetBlueprintComposesApiResponse,
      GetBlueprintComposesApiArg
    >({
      query: (queryArg) => ({
        url: `/blueprints/${queryArg.id}/composes`,
        params: {
          blueprint_version: queryArg.blueprintVersion,
          limit: queryArg.limit,
          offset: queryArg.offset,
          ignoreImageTypes: queryArg.ignoreImageTypes,
        },
      }),
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
    getOscapCustomizationsForPolicy: build.query<
      GetOscapCustomizationsForPolicyApiResponse,
      GetOscapCustomizationsForPolicyApiArg
    >({
      query: (queryArg) => ({
        url: `/oscap/${queryArg.policy}/${queryArg.distribution}/policy_customizations`,
      }),
    }),
    recommendPackage: build.mutation<
      RecommendPackageApiResponse,
      RecommendPackageApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/recommendations`,
        method: "POST",
        body: queryArg.recommendPackageRequest,
      }),
    }),
    fixupBlueprint: build.mutation<
      FixupBlueprintApiResponse,
      FixupBlueprintApiArg
    >({
      query: (queryArg) => ({
        url: `/experimental/blueprints/${queryArg.id}/fixup`,
        method: "POST",
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
export type GetBlueprintsApiResponse =
  /** status 200 a list of blueprints */ BlueprintsResponse;
export type GetBlueprintsApiArg = {
  /** fetch blueprint with specific name */
  name?: string;
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
export type GetBlueprintApiResponse =
  /** status 200 detail of a blueprint */ BlueprintResponse;
export type GetBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
  /** Filter by a specific version of the Blueprint we want to fetch.
    Omit or pass -1 to fetch latest version.
     */
  version?: number;
};
export type DeleteBlueprintApiResponse = unknown;
export type DeleteBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
};
export type ExportBlueprintApiResponse =
  /** status 200 detail of a blueprint */ BlueprintExportResponse;
export type ExportBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
};
export type ComposeBlueprintApiResponse =
  /** status 201 compose was created */ ComposeResponse[];
export type ComposeBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
  /** list of target image types that the user wants to build for this compose */
  body: {
    image_types?: ImageTypes[] | undefined;
  };
};
export type GetBlueprintComposesApiResponse =
  /** status 200 a list of composes */ ComposesResponse;
export type GetBlueprintComposesApiArg = {
  /** UUID of a blueprint */
  id: string;
  /** Filter by a specific version of the Blueprint we want to fetch composes for.
    Pass special value -1 to fetch composes for latest version of the Blueprint.
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
export type GetOscapCustomizationsForPolicyApiResponse =
  /** status 200 A customizations array updated with the needed elements.
   */ Customizations;
export type GetOscapCustomizationsForPolicyApiArg = {
  policy: string;
  distribution: Distributions;
};
export type RecommendPackageApiResponse =
  /** status 200 Return the recommended packages. */ RecommendationsResponse;
export type RecommendPackageApiArg = {
  recommendPackageRequest: RecommendPackageRequest;
};
export type FixupBlueprintApiResponse = unknown;
export type FixupBlueprintApiArg = {
  /** UUID of a blueprint */
  id: string;
};
export type Repository = {
  /** An ID referring to a repository defined in content sources can be used instead of
    'baseurl', 'mirrorlist' or 'metalink'.
     */
  id?: string | undefined;
  rhsm: boolean;
  baseurl?: string | undefined;
  mirrorlist?: string | undefined;
  metalink?: string | undefined;
  gpgkey?: string | undefined;
  check_gpg?: boolean | undefined;
  /** Enables gpg verification of the repository metadata
   */
  check_repo_gpg?: boolean | undefined;
  ignore_ssl?: boolean | undefined;
  module_hotfixes?: boolean | undefined;
};
export type ArchitectureItem = {
  arch: string;
  image_types: string[];
  /** Base repositories for the given distribution and architecture. */
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
  | "rhel-8.10"
  | "rhel-9"
  | "rhel-9-nightly"
  | "rhel-9.6-nightly"
  | "rhel-9.7-nightly"
  | "rhel-9.8-nightly"
  | "rhel-9.9-nightly"
  | "rhel-9-beta"
  | "rhel-90"
  | "rhel-91"
  | "rhel-92"
  | "rhel-93"
  | "rhel-94"
  | "rhel-95"
  | "rhel-9.6"
  | "rhel-9.7"
  | "rhel-10"
  | "rhel-10-nightly"
  | "rhel-10.0-nightly"
  | "rhel-10.1-nightly"
  | "rhel-10.2-nightly"
  | "rhel-10.3-nightly"
  | "rhel-10-beta"
  | "rhel-10.0"
  | "rhel-10.1"
  | "centos-9"
  | "centos-10"
  | "fedora-37"
  | "fedora-38"
  | "fedora-39"
  | "fedora-40"
  | "fedora-41"
  | "fedora-42"
  | "fedora-43"
  | "fedora-44";
export type ListResponseMeta = {
  count: number;
};
export type ListResponseLinks = {
  first: string;
  last: string;
};
export type BlueprintItem = {
  id: string;
  version: number;
  name: string;
  description: string;
  last_modified_at: string;
};
export type BlueprintsResponse = {
  meta: ListResponseMeta;
  links: ListResponseLinks;
  data: BlueprintItem[];
};
export type CreateBlueprintResponse = {
  id: string;
};
export type ImageTypes =
  | "aws"
  | "azure"
  | "edge-commit"
  | "edge-installer"
  | "gcp"
  | "guest-image"
  | "image-installer"
  | "network-installer"
  | "oci"
  | "pxe-tar-xz"
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
  share_with_accounts?: string[] | undefined;
  share_with_sources?: string[] | undefined;
};
export type Awss3UploadRequestOptions = object;
export type GcpUploadRequestOptions = {
  /** List of valid Google accounts to share the imported Compute Node image with.
    Each string must contain a specifier of the account type. Valid formats are:
      - 'user:{emailid}': An email address that represents a specific
        Google account. For example, 'alice@example.com'.
      - 'serviceAccount:{emailid}': An email address that represents a
        service account. For example, 'my-other-app@appspot.gserviceaccount.com'.
      - 'group:{emailid}': An email address that represents a Google group.
        For example, 'admins@example.com'.
      - 'domain:{domain}': The G Suite domain (primary) that represents all
        the users of that domain. For example, 'google.com' or 'example.com'.
        If not specified, the imported Compute Node image is not shared with any
        account.
     */
  share_with_accounts?: string[] | undefined;
};
export type AzureUploadRequestOptions = {
  /** ID of the tenant where the image should be uploaded. This link explains how
    to find it in the Azure Portal:
    https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant
     */
  tenant_id?: string | undefined;
  /** ID of subscription where the image should be uploaded.
   */
  subscription_id?: string | undefined;
  /** Name of the resource group where the image should be uploaded.
   */
  resource_group: string;
  /** Name of the created image.
    Must begin with a letter or number, end with a letter, number or underscore, and may contain only letters, numbers, underscores, periods, or hyphens.
    The total length is limited to 60 characters.
     */
  image_name?: string | undefined;
  /** Choose the VM Image HyperV generation, different features on Azure are available
    depending on the HyperV generation.
     */
  hyper_v_generation?: ("V1" | "V2") | undefined;
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
  url?: string | undefined;
  /** A URL which, if set, is used for fetching content. Implies that `url` is set as well,
    which will be used for metadata only.
     */
  contenturl?: string | undefined;
  ref?: string | undefined;
  /** Can be either a commit (example: 02604b2da6e954bd34b8b82a835e5a77d2b60ffa), or a branch-like reference (example: rhel/8/x86_64/edge)
   */
  parent?: string | undefined;
  /** Determines whether a valid subscription manager (candlepin) identity is required to
    access this repository. Consumer certificates will be used as client certificates when
     fetching metadata and content.
     */
  rhsm?: boolean | undefined;
};
export type ImageRequest = {
  /** CPU architecture of the image, x86_64 and aarch64 are currently supported.
   */
  architecture: "x86_64" | "aarch64";
  image_type: ImageTypes;
  upload_request: UploadRequest;
  ostree?: OsTree | undefined;
  /** Size of image, in bytes. When set to 0 the image size is a minimum
    defined by the image type.
     */
  size?: any | undefined;
  /** Snapshotted content will be used instead of the official repositories of the
    distribution. The snapshot that was made closest to, but before the specified date will
    be used. If no snapshots made before the specified date can be found, the snapshot
    closest to, but after the specified date will be used. If no snapshots can be found at
    all, the request will fail. The format must be RFC3339 e.g. "2025-11-26T00:00:00.000Z".
     */
  snapshot_date?: string | undefined;
  /** ID of the content template. A content template and snapshot date cannot both be specified.
    If a content template is specified, the snapshot date used will be the one from the content template.
     */
  content_template?: string | undefined;
  /** Name of the content template. Used when registering the system to Insights.
   */
  content_template_name?: string | undefined;
};
export type Container = {
  /** Reference to the container to embed */
  source: string;
  /** Name to use for the container from the image */
  name?: string | undefined;
  /** Control TLS verifification */
  tls_verify?: boolean | undefined;
};
export type Directory = {
  /** Path to the directory */
  path: string;
  /** Permissions string for the directory in octal format */
  mode?: string | undefined;
  /** Owner of the directory as a user name or a uid */
  user?: (string | number) | undefined;
  /** Group of the directory as a group name or a gid */
  group?: (string | number) | undefined;
  /** Ensure that the parent directories exist */
  ensure_parents?: boolean | undefined;
};
export type File = {
  /** Path to the file */
  path: string;
  /** Permissions string for the file in octal format */
  mode?: string | undefined;
  /** Owner of the file as a uid or a user name */
  user?: (string | number) | undefined;
  /** Group of the file as a gid or a group name */
  group?: (string | number) | undefined;
  /** Contents of the file as plain text */
  data?: string | undefined;
  /** When data is base64-encoded to prevent Akamai content filter false positives */
  data_encoding?: ("plain" | "base64") | undefined;
  /** Ensure that the parent directories exist */
  ensure_parents?: boolean | undefined;
};
export type Subscription = {
  organization: number;
  "activation-key": string;
  "server-url": string;
  "base-url": string;
  insights: boolean;
  /** Optional flag to use rhc to register the system, which also always enables Insights.
   */
  rhc?: boolean | undefined;
  /** Optional value to set proxy option when registering the system to Insights.
   */
  insights_client_proxy?: string | undefined;
};
export type Module = {
  /** Name of the module to enable.
   */
  name: string;
  /** Stream to enable.
   */
  stream: string;
};
export type CustomRepository = {
  id: string;
  name?: string | undefined;
  filename?: string | undefined;
  baseurl?: string[] | undefined;
  mirrorlist?: string | undefined;
  metalink?: string | undefined;
  /** GPG key used to sign packages in this repository. Can be a gpg key or a URL */
  gpgkey?: string[] | undefined;
  check_gpg?: boolean | undefined;
  check_repo_gpg?: boolean | undefined;
  enabled?: boolean | undefined;
  priority?: number | undefined;
  ssl_verify?: boolean | undefined;
  module_hotfixes?: boolean | undefined;
};
export type OpenScapProfile = {
  /** Uses the OpenSCAP tooling directly to apply a pre-defined profile without tailorings.
   */
  profile_id: string;
  /** The profile type */
  profile_name?: string | undefined;
  /** The longform profile description */
  profile_description?: string | undefined;
};
export type OpenScapCompliance = {
  /** Apply a compliance policy which is defined in the Red Hat Insights Compliance
    service. This policy can include tailorings. This only works for RHEL images, and the
    policy needs to be available for the specific RHEL version.
     */
  policy_id: string;
};
export type OpenScap = OpenScapProfile | OpenScapCompliance;
export type Filesystem = {
  mountpoint: string;
  /** size of the filesystem in bytes */
  min_size: any;
};
export type Minsize = string;
export type FilesystemTyped = {
  type?: "plain" | undefined;
  /** The partition type GUID for GPT partitions. For DOS partitions, this field can be used to set the (2 hex digit) partition type. If not set, the type will be automatically set based on the mountpoint or the payload type.
   */
  part_type?: string | undefined;
  minsize?: Minsize | undefined;
  mountpoint?: string | undefined;
  label?: string | undefined;
  /** The filesystem type. Swap partitions must have an empty mountpoint.
   */
  fs_type: "ext4" | "xfs" | "vfat" | "swap";
};
export type BtrfsSubvolume = {
  /** The name of the subvolume, which defines the location (path) on the root volume
   */
  name: string;
  /** Mountpoint for the subvolume
   */
  mountpoint: string;
};
export type BtrfsVolume = {
  type: "btrfs";
  /** The partition type GUID for GPT partitions. For DOS partitions, this field can be used to set the (2 hex digit) partition type. If not set, the type will be automatically set based on the mountpoint or the payload type.
   */
  part_type?: string | undefined;
  minsize?: Minsize | undefined;
  subvolumes: BtrfsSubvolume[];
};
export type LogicalVolume = {
  name?: string | undefined;
  minsize?: Minsize | undefined;
  /** Mountpoint for the logical volume
   */
  mountpoint?: string | undefined;
  label?: string | undefined;
  /** The filesystem type for the logical volume. Swap LVs must have an empty mountpoint.
   */
  fs_type: "ext4" | "xfs" | "vfat" | "swap";
};
export type VolumeGroup = {
  type: "lvm";
  /** The partition type GUID for GPT partitions. For DOS partitions, this field can be used to set the (2 hex digit) partition type. If not set, the type will be automatically set based on the mountpoint or the payload type.
   */
  part_type?: string | undefined;
  /** Volume group name (will be automatically generated if omitted)
   */
  name?: string | undefined;
  minsize?: Minsize | undefined;
  logical_volumes: LogicalVolume[];
};
export type Partition = FilesystemTyped | BtrfsVolume | VolumeGroup;
export type Disk = {
  /** Type of the partition table
   */
  type?: ("gpt" | "dos") | undefined;
  minsize?: Minsize | undefined;
  partitions: Partition[];
};
export type User = {
  name: string;
  /** List of groups to add the user to. The 'wheel' group should be added explicitly, as the
    default value is empty.
     */
  groups?: string[] | undefined;
  ssh_key?: string | undefined;
  /** Plaintext passwords are also supported, they will be hashed and stored using the SHA-512 algorithm.
    The password is never returned in the response.
    Empty string can be used to remove the password during update but only with ssh_key set.
     */
  password?: string | undefined;
  /** Indicates whether the user has a password set. This flag is read-only.
   */
  hasPassword?: boolean | undefined;
};
export type Services = {
  /** List of services to enable by default */
  enabled?: string[] | undefined;
  /** List of services to disable by default */
  disabled?: string[] | undefined;
  /** List of services to mask by default */
  masked?: string[] | undefined;
};
export type Kernel = {
  /** Name of the kernel to use */
  name?: string | undefined;
  /** Appends arguments to the bootloader kernel command line */
  append?: string | undefined;
};
export type Group = {
  /** Name of the group to create */
  name: string;
  /** Group id of the group to create (optional) */
  gid?: number | undefined;
};
export type Timezone = {
  /** Name of the timezone, defaults to UTC */
  timezone?: string | undefined;
  /** List of ntp servers */
  ntpservers?: string[] | undefined;
};
export type Locale = {
  /** List of locales to be installed, the first one becomes primary, subsequent ones are secondary
   */
  languages?: string[] | undefined;
  /** Sets the keyboard layout */
  keyboard?: string | undefined;
};
export type FirewallCustomization = {
  /** List of ports (or port ranges) and protocols to open */
  ports?: string[] | undefined;
  /** Firewalld services to enable or disable */
  services?:
    | {
        /** List of services to enable */
        enabled?: string[] | undefined;
        /** List of services to disable */
        disabled?: string[] | undefined;
      }
    | undefined;
};
export type Fdo = {
  manufacturing_server_url?: string | undefined;
  diun_pub_key_insecure?: string | undefined;
  diun_pub_key_hash?: string | undefined;
  diun_pub_key_root_certs?: string | undefined;
};
export type IgnitionEmbedded = {
  config: string;
};
export type IgnitionFirstboot = {
  /** Provisioning URL */
  url: string;
};
export type Ignition = {
  embedded?: IgnitionEmbedded | undefined;
  firstboot?: IgnitionFirstboot | undefined;
};
export type Fips = {
  /** Enables the system FIPS mode */
  enabled?: boolean | undefined;
};
export type Installer = {
  /** Create a kickstart file for a fully automated installation
   */
  unattended?: boolean | undefined;
  "sudo-nopasswd"?: string[] | undefined;
};
export type CaCertsCustomization = {
  pem_certs: string[];
};
export type AapRegistration = {
  ansible_callback_url: string;
  host_config_key: string;
  tls_certificate_authority?: string | undefined;
  /** When true, indicates the user has confirmed that HTTPS callback URL does not require a CA certificate for verification */
  skip_tls_verification?: boolean | undefined;
};
export type Customizations = {
  containers?: Container[] | undefined;
  directories?: Directory[] | undefined;
  files?: File[] | undefined;
  subscription?: Subscription | undefined;
  packages?: string[] | undefined;
  /** List of dnf modules to enable, so that packages can be installed from them.
   */
  enabled_modules?: Module[] | undefined;
  payload_repositories?: Repository[] | undefined;
  /** List of custom repositories. */
  custom_repositories?: CustomRepository[] | undefined;
  openscap?: OpenScap | undefined;
  filesystem?: Filesystem[] | undefined;
  disk?: Disk | undefined;
  /** List of users that a customer can add,
    also specifying their respective groups and SSH keys and/or password
     */
  users?: User[] | undefined;
  services?: Services | undefined;
  /** Configures the hostname */
  hostname?: string | undefined;
  kernel?: Kernel | undefined;
  /** List of groups to create */
  groups?: Group[] | undefined;
  timezone?: Timezone | undefined;
  locale?: Locale | undefined;
  firewall?: FirewallCustomization | undefined;
  /** Name of the installation device, currently only useful for the edge-simplified-installer type
   */
  installation_device?: string | undefined;
  fdo?: Fdo | undefined;
  ignition?: Ignition | undefined;
  /** Select how the disk image will be partitioned. 'auto-lvm' will use raw unless
    there are one or more mountpoints in which case it will use LVM. 'lvm' always
    uses LVM, even when there are no extra mountpoints. 'raw' uses raw partitions
    even when there are one or more mountpoints.
     */
  partitioning_mode?: ("raw" | "lvm" | "auto-lvm") | undefined;
  fips?: Fips | undefined;
  installer?: Installer | undefined;
  cacerts?: CaCertsCustomization | undefined;
  aap_registration?: AapRegistration | undefined;
};
export type BlueprintMetadata = {
  parent_id: string | null;
  exported_at: string;
  is_on_prem: boolean;
};
export type CreateBlueprintRequest = {
  name: string;
  description?: string | undefined;
  distribution: Distributions;
  /** Array of image requests. Having more image requests in a single blueprint is currently not supported.
   */
  image_requests: ImageRequest[];
  customizations: Customizations;
  metadata?: BlueprintMetadata | undefined;
};
export type BlueprintLintItem = {
  name: string;
  description: string;
};
export type BlueprintLint = {
  errors: BlueprintLintItem[];
  warnings: BlueprintLintItem[];
};
export type BlueprintResponse = {
  id: string;
  name: string;
  description: string;
  lint: BlueprintLint;
  distribution: Distributions;
  /** Array of image requests. Having more image requests in a single blueprint is currently not supported.
   */
  image_requests: ImageRequest[];
  customizations: Customizations;
};
export type BlueprintExportResponse = {
  name: string;
  description: string;
  distribution: Distributions;
  customizations: Customizations;
  metadata: BlueprintMetadata;
  /** List of custom repositories including all the repository details needed in order
    to recreate the repositories.
     */
  content_sources?: object[] | undefined;
  /** Importing the snapshot date will not yet be supported. It is exported for informative reasons.
    The format is RFC3339 e.g. "2025-11-26T00:00:00.000Z".
     */
  snapshot_date?: string | undefined;
};
export type ComposeResponse = {
  id: string;
};
export type ClientId = "api" | "ui" | "mcp";
export type ComposeRequest = {
  distribution: Distributions;
  image_name?: string | undefined;
  image_description?: string | undefined;
  client_id?: ClientId | undefined;
  /** Array of exactly one image request. Having more image requests in one compose is currently not supported.
   */
  image_requests: ImageRequest[];
  customizations?: Customizations | undefined;
};
export type ComposesResponseItem = {
  id: string;
  request: ComposeRequest;
  created_at: string;
  image_name?: string | undefined;
  client_id?: ClientId | undefined;
  blueprint_id?: (string | null) | undefined;
  blueprint_version?: (number | null) | undefined;
};
export type ComposesResponse = {
  meta: ListResponseMeta;
  links: ListResponseLinks;
  data: ComposesResponseItem[];
};
export type SubProgress = {
  /** Amount of completed steps in the build. */
  done: number;
  /** Total amount of steps in the build. */
  total: number;
};
export type Progress = SubProgress & {
  subprogress?: SubProgress | undefined;
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
  details?: any | undefined;
};
export type ImageStatus = {
  status:
    | "success"
    | "failure"
    | "pending"
    | "building"
    | "uploading"
    | "registering";
  progress?: Progress | undefined;
  upload_status?: UploadStatus | undefined;
  error?: ComposeStatusError | undefined;
};
export type ComposeStatus = {
  image_status: ImageStatus;
  request: ComposeRequest;
};
export type Package = {
  name: string;
  summary: string;
};
export type PackagesResponse = {
  meta: ListResponseMeta;
  links: ListResponseLinks;
  data: Package[];
};
export type DistributionProfileItem =
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_enhanced"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_high"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_intermediary"
  | "xccdf_org.ssgproject.content_profile_anssi_bp28_minimal"
  | "xccdf_org.ssgproject.content_profile_ccn_advanced"
  | "xccdf_org.ssgproject.content_profile_ccn_basic"
  | "xccdf_org.ssgproject.content_profile_ccn_intermediate"
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
export type RecommendationsResponse = {
  packages: string[];
  modelVersion?: string | undefined;
};
export type RecommendPackageRequest = {
  packages: string[];
  recommendedPackages: number;
  distribution: string;
};
export const {
  useGetArchitecturesQuery,
  useLazyGetArchitecturesQuery,
  useGetBlueprintsQuery,
  useLazyGetBlueprintsQuery,
  useCreateBlueprintMutation,
  useUpdateBlueprintMutation,
  useGetBlueprintQuery,
  useLazyGetBlueprintQuery,
  useDeleteBlueprintMutation,
  useExportBlueprintQuery,
  useLazyExportBlueprintQuery,
  useComposeBlueprintMutation,
  useGetBlueprintComposesQuery,
  useLazyGetBlueprintComposesQuery,
  useGetComposesQuery,
  useLazyGetComposesQuery,
  useGetComposeStatusQuery,
  useLazyGetComposeStatusQuery,
  useComposeImageMutation,
  useGetPackagesQuery,
  useLazyGetPackagesQuery,
  useGetOscapProfilesQuery,
  useLazyGetOscapProfilesQuery,
  useGetOscapCustomizationsQuery,
  useLazyGetOscapCustomizationsQuery,
  useGetOscapCustomizationsForPolicyQuery,
  useLazyGetOscapCustomizationsForPolicyQuery,
  useRecommendPackageMutation,
  useFixupBlueprintMutation,
} = injectedRtkApi;
