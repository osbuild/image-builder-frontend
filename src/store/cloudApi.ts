import { emptyCloudApi as api } from './emptyCloudApi';
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getComposeStatus: build.query<
      GetComposeStatusApiResponse,
      GetComposeStatusApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.id}` }),
    }),
    getComposeMetadata: build.query<
      GetComposeMetadataApiResponse,
      GetComposeMetadataApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.id}/metadata` }),
    }),
    getComposeLogs: build.query<
      GetComposeLogsApiResponse,
      GetComposeLogsApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.id}/logs` }),
    }),
    getComposeManifests: build.query<
      GetComposeManifestsApiResponse,
      GetComposeManifestsApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.id}/manifests` }),
    }),
    postCloneCompose: build.mutation<
      PostCloneComposeApiResponse,
      PostCloneComposeApiArg
    >({
      query: (queryArg) => ({
        url: `/composes/${queryArg.id}/clone`,
        method: 'POST',
        body: queryArg.cloneComposeBody,
      }),
    }),
    getCloneStatus: build.query<
      GetCloneStatusApiResponse,
      GetCloneStatusApiArg
    >({
      query: (queryArg) => ({ url: `/clones/${queryArg.id}` }),
    }),
    postCompose: build.mutation<PostComposeApiResponse, PostComposeApiArg>({
      query: (queryArg) => ({
        url: `/compose`,
        method: 'POST',
        body: queryArg.composeRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as cloudApi };
export type GetComposeStatusApiResponse =
  /** status 200 compose status */ ComposeStatus;
export type GetComposeStatusApiArg = {
  /** ID of compose status to get */
  id: string;
};
export type GetComposeMetadataApiResponse =
  /** status 200 The metadata for the given compose. */ ComposeMetadata;
export type GetComposeMetadataApiArg = {
  /** ID of compose status to get */
  id: string;
};
export type GetComposeLogsApiResponse =
  /** status 200 The logs for the given compose, in no particular format (though valid JSON). */ ComposeLogs;
export type GetComposeLogsApiArg = {
  /** ID of compose status to get */
  id: string;
};
export type GetComposeManifestsApiResponse =
  /** status 200 The manifest for the given compose. */ ComposeManifests;
export type GetComposeManifestsApiArg = {
  /** ID of compose status to get */
  id: string;
};
export type PostCloneComposeApiResponse =
  /** status 201 The new image is being created */ CloneComposeResponse;
export type PostCloneComposeApiArg = {
  /** ID of the compose */
  id: string;
  cloneComposeBody: CloneComposeBody;
};
export type GetCloneStatusApiResponse =
  /** status 200 image status */ CloneStatus;
export type GetCloneStatusApiArg = {
  /** ID of image status to get */
  id: string;
};
export type PostComposeApiResponse =
  /** status 201 Compose has started */ ComposeId;
export type PostComposeApiArg = {
  composeRequest: ComposeRequest;
};
export type ObjectReference = {
  id: string;
  kind: string;
  href: string;
};
export type ComposeStatusValue = 'success' | 'failure' | 'pending';
export type ImageStatusValue =
  | 'success'
  | 'failure'
  | 'pending'
  | 'building'
  | 'uploading'
  | 'registering';
export type UploadStatusValue = 'success' | 'failure' | 'pending' | 'running';
export type UploadTypes =
  | 'aws'
  | 'aws.s3'
  | 'gcp'
  | 'azure'
  | 'container'
  | 'oci.objectstorage'
  | 'pulp.ostree'
  | 'local';
export type Awsec2UploadStatus = {
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
export type ContainerUploadStatus = {
  /** FQDN of the uploaded image
   */
  url: string;
  /** Digest of the manifest of the uploaded container on the registry
   */
  digest: string;
};
export type OciUploadStatus = {
  url: string;
};
export type PulpOsTreeUploadStatus = {
  repo_url: string;
};
export type UploadStatus = {
  status: UploadStatusValue;
  type: UploadTypes;
  options:
    | Awsec2UploadStatus
    | Awss3UploadStatus
    | GcpUploadStatus
    | AzureUploadStatus
    | ContainerUploadStatus
    | OciUploadStatus
    | PulpOsTreeUploadStatus;
};
export type ComposeStatusError = {
  id: number;
  reason: string;
  details?: any;
};
export type ImageStatus = {
  status: ImageStatusValue;
  upload_status?: UploadStatus;
  upload_statuses?: UploadStatus[];
  error?: ComposeStatusError;
};
export type KojiStatus = {
  build_id?: number;
};
export type ComposeStatus = ObjectReference & {
  status: ComposeStatusValue;
  image_status: ImageStatus;
  image_statuses?: ImageStatus[];
  koji_status?: KojiStatus;
};
export type Error = ObjectReference & {
  code: string;
  reason: string;
  operation_id: string;
  details?: any;
};
export type PackageMetadata = {
  type: string;
  name: string;
  version: string;
  release: string;
  epoch?: string;
  arch: string;
  sigmd5: string;
  signature?: string;
};
export type ComposeMetadata = ObjectReference & {
  /** Package list including NEVRA */
  packages?: PackageMetadata[];
  /** ID (hash) of the built commit */
  ostree_commit?: string;
};
export type KojiLogs = {
  init: any;
  import: any;
};
export type ComposeLogs = ObjectReference & {
  image_builds: object[];
  koji?: KojiLogs;
};
export type ComposeManifests = ObjectReference & {
  manifests: object[];
};
export type CloneComposeResponse = ObjectReference & {
  id: string;
};
export type Awsec2CloneCompose = {
  region: string;
  share_with_accounts?: string[];
};
export type CloneComposeBody = Awsec2CloneCompose;
export type CloneStatus = ObjectReference & UploadStatus;
export type ComposeId = ObjectReference & {
  id: string;
};
export type ImageTypes =
  | 'aws'
  | 'aws-ha-rhui'
  | 'aws-rhui'
  | 'aws-sap-rhui'
  | 'azure'
  | 'azure-eap7-rhui'
  | 'azure-rhui'
  | 'azure-sap-rhui'
  | 'edge-commit'
  | 'edge-container'
  | 'edge-installer'
  | 'gcp'
  | 'gcp-rhui'
  | 'guest-image'
  | 'image-installer'
  | 'iot-bootable-container'
  | 'iot-commit'
  | 'iot-container'
  | 'iot-installer'
  | 'iot-raw-image'
  | 'iot-simplified-installer'
  | 'live-installer'
  | 'minimal-raw'
  | 'oci'
  | 'vsphere'
  | 'vsphere-ova'
  | 'wsl';
export type Repository = {
  /** Determines whether a valid subscription is required to access this repository. */
  rhsm?: boolean;
  baseurl?: string;
  mirrorlist?: string;
  metalink?: string;
  /** GPG key used to sign packages in this repository. */
  gpgkey?: string;
  check_gpg?: boolean;
  /** Enables gpg verification of the repository metadata
   */
  check_repo_gpg?: boolean;
  ignore_ssl?: boolean;
  /** Disables modularity filtering for this repository.
   */
  module_hotfixes?: boolean;
  /** Naming package sets for a repository assigns it to a specific part
    (pipeline) of the build process.
     */
  package_sets?: string[];
};
export type OsTree = {
  url?: string;
  /** A URL which, if set, is used for fetching content. Implies that `url` is set as well,
    which will be used for metadata only.
     */
  contenturl?: string;
  ref?: string;
  /** Can be either a commit (example: 02604b2da6e954bd34b8b82a835e5a77d2b60ffa), or a branch-like reference (example: rhel/8/x86_64/edge)
   */
  parent?: string;
  /** Determines whether a valid subscription manager (candlepin) identity is required to
    access this repository. Consumer certificates will be used as client certificates when
    fetching metadata and content.
     */
  rhsm?: boolean;
};
export type Awsec2UploadOptions = {
  region: string;
  snapshot_name?: string;
  share_with_accounts: string[];
};
export type Awss3UploadOptions = {
  region: string;
  /** If set to false (the default value), a long, obfuscated URL
    is returned. Its expiration might be sooner than for other upload
    targets.

    If set to true, a shorter URL is returned and
    its expiration is the same as for the other upload targets.
     */
  public?: boolean;
};
export type GcpUploadOptions = {
  /** The GCP region where the OS image will be imported to and shared from.
    The value must be a valid GCP location. See https://cloud.google.com/storage/docs/locations.
    If not specified, the multi-region location closest to the source
    (source Storage Bucket location) is chosen automatically.
     */
  region: string;
  /** Name of an existing STANDARD Storage class Bucket. */
  bucket?: string;
  /** The name to use for the imported and shared Compute Engine image.
    The image name must be unique within the GCP project, which is used
    for the OS image upload and import. If not specified a random
    'composer-api-<uuid>' string is used as the image name.
     */
  image_name?: string;
  /** List of valid Google accounts to share the imported Compute Engine image with.
    Each string must contain a specifier of the account type. Valid formats are:
      - 'user:{emailid}': An email address that represents a specific
        Google account. For example, 'alice@example.com'.
      - 'serviceAccount:{emailid}': An email address that represents a
        service account. For example, 'my-other-app@appspot.gserviceaccount.com'.
      - 'group:{emailid}': An email address that represents a Google group.
        For example, 'admins@example.com'.
      - 'domain:{domain}': The G Suite domain (primary) that represents all
        the users of that domain. For example, 'google.com' or 'example.com'.
    If not specified, the imported Compute Engine image is not shared with any
    account.
     */
  share_with_accounts?: string[];
};
export type AzureUploadOptions = {
  /** ID of the tenant where the image should be uploaded.
    How to find it in the Azure Portal:
    https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-how-to-find-tenant
     */
  tenant_id: string;
  /** ID of subscription where the image should be uploaded.
   */
  subscription_id: string;
  /** Name of the resource group where the image should be uploaded.
   */
  resource_group: string;
  /** Location of the provided resource_group, where the image should be uploaded and registered.
    How to list all locations:
    https://docs.microsoft.com/en-us/cli/azure/account?view=azure-cli-latest#az_account_list_locations'
    If the location is not specified, it is deducted from the provided resource_group.
     */
  location?: string;
  /** Name of the uploaded image. It must be unique in the given resource group.
    If name is omitted from the request, a random one based on a UUID is
    generated.
     */
  image_name?: string;
};
export type ContainerUploadOptions = {
  /** Name for the created container image
   */
  name?: string;
  /** Tag for the created container image
   */
  tag?: string;
};
export type LocalUploadOptions = {
  /** This is used in combination with the OSBUILD_LOCALSAVE environmental
    variable on the server to enable saving the compose locally. This
    is for development use only, and is not available to users.
     */
  local_save: boolean;
};
export type OciUploadOptions = object;
export type PulpOsTreeUploadOptions = {
  /** Basepath for distributing the repository */
  basepath: string;
  /** Repository to import the ostree commit to */
  repository?: string;
  server_address?: string;
};
export type UploadOptions =
  | Awsec2UploadOptions
  | Awss3UploadOptions
  | GcpUploadOptions
  | AzureUploadOptions
  | ContainerUploadOptions
  | LocalUploadOptions
  | OciUploadOptions
  | PulpOsTreeUploadOptions;
export type UploadTarget = {
  /** The name of the upload target that matches the upload_options.
   */
  type: UploadTypes;
  upload_options: UploadOptions;
};
export type ImageRequest = {
  architecture: string;
  image_type: ImageTypes;
  repositories: Repository[];
  ostree?: OsTree;
  /** The type and options for multiple upload targets. Each item defines
    a separate upload destination with its own options. Multiple
    different targets as well as multiple targets of the same kind are
    supported.
     */
  upload_targets?: UploadTarget[];
  /** Top level upload options for a single upload target. If this is
    defined, it is used with the default target type for the image type
    and is combined with the targets defined in upload_targets.
     */
  upload_options?: UploadOptions;
  /** Size of image, in bytes. When set to 0 the image size is a minimum
    defined by the image type.
     */
  size?: any;
};
export type Container = {
  /** Reference to the container to embed */
  source: string;
  /** Name to use for the container from the image */
  name?: string;
  /** Control TLS verifification */
  tls_verify?: boolean;
};
export type Directory = {
  /** Path to the directory */
  path: string;
  /** Permissions string for the directory in octal format */
  mode?: string;
  /** Owner of the directory as a user name or a uid */
  user?: string | number;
  /** Group of the directory as a group name or a gid */
  group?: string | number;
  /** Ensure that the parent directories exist */
  ensure_parents?: boolean;
};
export type File = {
  /** Path to the file */
  path: string;
  /** Permissions string for the file in octal format */
  mode?: string;
  /** Owner of the file as a uid or a user name */
  user?: string | number;
  /** Group of the file as a gid or a group name */
  group?: string | number;
  /** Contents of the file as plain text */
  data?: string;
  /** Ensure that the parent directories exist */
  ensure_parents?: boolean;
};
export type Subscription = {
  organization: string;
  activation_key: string;
  server_url: string;
  base_url: string;
  insights: boolean;
  /** Optional flag to use rhc to register the system, which also always enables Insights.
   */
  rhc?: boolean;
};
export type User = {
  name: string;
  groups?: string[];
  key?: string;
  /** If the password starts with $6$, $5$, or $2b$ it will be stored as
    an encrypted password. Otherwise it will be treated as a plain text
    password.
     */
  password?: string;
};
export type CustomRepository = {
  id: string;
  name?: string;
  filename?: string;
  baseurl?: string[];
  mirrorlist?: string;
  metalink?: string;
  enabled?: boolean;
  gpgkey?: string[];
  check_gpg?: boolean;
  check_repo_gpg?: boolean;
  ssl_verify?: boolean;
  priority?: number;
  module_hotfixes?: boolean;
};
export type OpenScapTailoring = {
  selected?: string[];
  unselected?: string[];
};
export type OpenScapjsonTailoring = {
  profile_id: string;
  filepath: string;
};
export type OpenScap = {
  /** Puts a specified policy ID in the RHSM facts, so that any instances registered to
    insights will be automatically connected to the compliance policy in the console.
     */
  policy_id?: string;
  profile_id: string;
  tailoring?: OpenScapTailoring;
  json_tailoring?: OpenScapjsonTailoring;
};
export type Filesystem = {
  mountpoint: string;
  /** size of the filesystem in bytes */
  min_size: any;
};
export type Services = {
  /** List of services to enable by default */
  enabled?: string[];
  /** List of services to disable by default */
  disabled?: string[];
  /** List of services to mask by default */
  masked?: string[];
};
export type Kernel = {
  /** Name of the kernel to use */
  name?: string;
  /** Appends arguments to the bootloader kernel command line */
  append?: string;
};
export type Group = {
  /** Name of the group to create */
  name: string;
  /** Group id of the group to create (optional) */
  gid?: number;
};
export type Timezone = {
  /** Name of the timezone, defaults to UTC */
  timezone?: string;
  /** List of ntp servers */
  ntpservers?: string[];
};
export type Locale = {
  /** List of locales to be installed, the first one becomes primary, subsequent ones are secondary
   */
  languages?: string[];
  /** Sets the keyboard layout */
  keyboard?: string;
};
export type FirewallServices = {
  /** List of services to enable */
  enabled?: string[];
  /** List of services to disable */
  disabled?: string[];
};
export type FirewallCustomization = {
  /** List of ports (or port ranges) and protocols to open */
  ports?: string[];
  services?: FirewallServices;
};
export type Fdo = {
  manufacturing_server_url?: string;
  diun_pub_key_insecure?: string;
  diun_pub_key_hash?: string;
  diun_pub_key_root_certs?: string;
  di_mfg_string_type_mac_iface?: string;
};
export type IgnitionEmbedded = {
  config: string;
};
export type IgnitionFirstboot = {
  /** Provisioning URL */
  url: string;
};
export type Ignition = {
  embedded?: IgnitionEmbedded;
  firstboot?: IgnitionFirstboot;
};
export type Fips = {
  /** Enables the system FIPS mode */
  enabled?: boolean;
};
export type Installer = {
  unattended?: boolean;
  'sudo-nopasswd'?: string[];
};
export type ImportKeys = {
  files?: string[];
};
export type RpmCustomization = {
  import_keys?: ImportKeys;
};
export type DnfPluginConfig = {
  enabled?: boolean;
};
export type SubManDnfPluginsConfig = {
  product_id?: DnfPluginConfig;
  subscription_manager?: DnfPluginConfig;
};
export type SubManRhsmConfig = {
  manage_repos?: boolean;
};
export type SubManRhsmCertdConfig = {
  auto_registration?: boolean;
};
export type SubManConfig = {
  rhsm?: SubManRhsmConfig;
  rhsmcertd?: SubManRhsmCertdConfig;
};
export type RhsmConfig = {
  dnf_plugins?: SubManDnfPluginsConfig;
  subscription_manager?: SubManConfig;
};
export type RhsmCustomization = {
  config?: RhsmConfig;
};
export type Customizations = {
  containers?: Container[];
  directories?: Directory[];
  files?: File[];
  subscription?: Subscription;
  packages?: string[];
  users?: User[];
  /** Extra repositories for packages specified in customizations. These
    repositories will only be used to depsolve and retrieve packages
    for the OS itself (they will not be available for the build root or
    any other part of the build process). The package_sets field for these
    repositories is ignored.
     */
  payload_repositories?: Repository[];
  /** Extra repositories for packages specified in customizations. These
    repositories will be used to depsolve and retrieve packages. Additionally,
    these packages will be saved and imported to the `/etc/yum.repos.d/` directory
    on the image
     */
  custom_repositories?: CustomRepository[];
  openscap?: OpenScap;
  filesystem?: Filesystem[];
  services?: Services;
  /** Configures the hostname */
  hostname?: string;
  kernel?: Kernel;
  /** List of groups to create */
  groups?: Group[];
  timezone?: Timezone;
  locale?: Locale;
  firewall?: FirewallCustomization;
  /** Name of the installation device, currently only useful for the edge-simplified-installer type
   */
  installation_device?: string;
  fdo?: Fdo;
  ignition?: Ignition;
  /** Select how the disk image will be partitioned. 'auto-lvm' will use raw unless
    there are one or more mountpoints in which case it will use LVM. 'lvm' always
    uses LVM, even when there are no extra mountpoints. 'raw' uses raw partitions
    even when there are one or more mountpoints.
     */
  partitioning_mode?: 'raw' | 'lvm' | 'auto-lvm';
  fips?: Fips;
  installer?: Installer;
  rpm?: RpmCustomization;
  rhsm?: RhsmCustomization;
};
export type Koji = {
  server: string;
  task_id: number;
  name: string;
  version: string;
  release: string;
};
export type Package = {
  /** Name of the package to install. File globbing is supported,
    eg. 'openssh-*'
     */
  name: string;
  /** Optional version of the package to install. If left blank the
    latest available version will be used. Wildcards are supported
    eg. '4.11.*'
     */
  version?: string;
};
export type PackageGroup = {
  /** Package group name */
  name: string;
};
export type SshKey = {
  /** User to configure the ssh key for */
  user: string;
  /** Adds the key to the user's authorized_keys file */
  key: string;
};
export type BlueprintUser = {
  name: string;
  description?: string;
  /** If the password starts with $6$, $5$, or $2b$ it will be stored as
    an encrypted password. Otherwise it will be treated as a plain text
    password.
     */
  password?: string;
  /** ssh public key */
  key?: string;
  /** The user's home directory */
  home?: string;
  /** Login shell to use */
  shell?: string;
  /** A list of additional groups to add the user to */
  groups?: string[];
  /** User id to use instead of the default */
  uid?: number;
  /** Group id to use instead of the default */
  gid?: number;
};
export type FirewallZones = {
  /** name of the zone, if left empty the sources will apply to
    the default zone.
     */
  name?: string;
  /** List of sources for the zone */
  sources?: string[];
};
export type BlueprintFirewall = {
  /** List of ports (or port ranges) and protocols to open */
  ports?: string[];
  services?: FirewallServices;
  zones?: FirewallZones[];
};
export type BlueprintFilesystem = {
  mountpoint: string;
  /** size of the filesystem in bytes */
  minsize: any;
};
export type BlueprintOpenScap = {
  /** Puts a specified policy ID in the RHSM facts, so that any instances registered to
    insights will be automatically connected to the compliance policy in the console.
     */
  policy_id?: string;
  profile_id: string;
  datastream?: string;
  tailoring?: OpenScapTailoring;
  json_tailoring?: OpenScapjsonTailoring;
};
export type BlueprintFile = {
  /** Path to the file */
  path: string;
  /** Permissions string for the file in octal format */
  mode?: string;
  /** Owner of the file as a uid or a user name */
  user?: string | number;
  /** Group of the file as a gid or a group name */
  group?: string | number;
  /** Contents of the file as plain text */
  data?: string;
};
export type BlueprintRepository = {
  id: string;
  baseurls?: string[];
  gpgkeys?: string[];
  metalink?: string;
  mirrorlist?: string;
  name?: string;
  priority?: number;
  enabled?: boolean;
  gpgcheck?: boolean;
  repo_gpgcheck?: boolean;
  sslverify?: boolean;
  filename?: string;
  /** Disables modularity filtering for this repository.
   */
  module_hotfixes?: boolean;
};
export type BlueprintCustomizations = {
  /** Configures the hostname */
  hostname?: string;
  kernel?: Kernel;
  /** List of ssh keys */
  sshkey?: SshKey[];
  /** List of users to create */
  user?: BlueprintUser[];
  /** List of groups to create */
  group?: Group[];
  timezone?: Timezone;
  locale?: Locale;
  firewall?: BlueprintFirewall;
  services?: Services;
  /** List of filesystem mountpoints to create */
  filesystem?: BlueprintFilesystem[];
  /** Name of the installation device, currently only useful for the edge-simplified-installer type
   */
  installation_device?: string;
  /** Select how the disk image will be partitioned. 'auto-lvm' will use raw unless
    there are one or more mountpoints in which case it will use LVM. 'lvm' always
    uses LVM, even when there are no extra mountpoints. 'raw' uses raw partitions
    even when there are one or more mountpoints.
     */
  partitioning_mode?: 'raw' | 'lvm' | 'auto-lvm';
  fdo?: Fdo;
  openscap?: BlueprintOpenScap;
  ignition?: Ignition;
  /** Directories to create in the final artifact */
  directories?: Directory[];
  /** Files to create in the final artifact */
  files?: BlueprintFile[];
  /** Repositories to write to /etc/yum.repos.d/ in the final image. Note
    that these are not used at build time.
     */
  repositories?: BlueprintRepository[];
  /** Enable FIPS mode */
  fips?: boolean;
  installer?: Installer;
  rpm?: RpmCustomization;
  rhsm?: RhsmCustomization;
};
export type Blueprint = {
  name: string;
  description?: string;
  /** A semver version number */
  version?: string;
  /** The distribution to use for the compose. If left empty the host
    distro will be used.
     */
  distro?: string;
  /** Packages to be installed */
  packages?: Package[];
  /** An alias for packages, retained for backwards compatability
   */
  modules?: Package[];
  /** Package groups to be installed */
  groups?: PackageGroup[];
  /** Container images to embed into the final artfact */
  containers?: Container[];
  customizations?: BlueprintCustomizations;
};
export type ComposeRequest = {
  distribution: string;
  image_request?: ImageRequest;
  image_requests?: ImageRequest[];
  customizations?: Customizations;
  koji?: Koji;
  blueprint?: Blueprint;
};
export const {
  useGetComposeStatusQuery,
  useLazyGetComposeStatusQuery,
  useGetComposeMetadataQuery,
  useLazyGetComposeMetadataQuery,
  useGetComposeLogsQuery,
  useLazyGetComposeLogsQuery,
  useGetComposeManifestsQuery,
  useLazyGetComposeManifestsQuery,
  usePostCloneComposeMutation,
  useGetCloneStatusQuery,
  useLazyGetCloneStatusQuery,
  usePostComposeMutation,
} = injectedRtkApi;
