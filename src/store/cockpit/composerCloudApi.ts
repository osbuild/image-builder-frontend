import { emptyComposerCloudApi as api } from "./emptyComposerCloudApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getComposeStatus: build.query<
      GetComposeStatusApiResponse,
      GetComposeStatusApiArg
    >({
      query: (queryArg) => ({ url: `/composes/${queryArg.id}` }),
    }),
    postCompose: build.mutation<PostComposeApiResponse, PostComposeApiArg>({
      query: (queryArg) => ({
        url: `/compose`,
        method: "POST",
        body: queryArg.composeRequest,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as composerCloudApi };
export type GetComposeStatusApiResponse =
  /** status 200 compose status */ ComposeStatus;
export type GetComposeStatusApiArg = {
  /** ID of compose status to get */
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
export type ComposeStatusValue = "success" | "failure" | "pending";
export type ImageStatusValue =
  | "success"
  | "failure"
  | "pending"
  | "building"
  | "uploading"
  | "registering";
export type UploadStatusValue = "success" | "failure" | "pending" | "running";
export type UploadTypes =
  | "aws"
  | "aws.s3"
  | "gcp"
  | "azure"
  | "container"
  | "oci.objectstorage"
  | "pulp.ostree"
  | "local";
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
export type LocalUploadStatus = {
  artifact_path: string;
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
    | PulpOsTreeUploadStatus
    | LocalUploadStatus;
};
export type ComposeStatusError = {
  id: number;
  reason: string;
  details?: any | undefined;
};
export type ImageStatus = {
  status: ImageStatusValue;
  upload_status?: UploadStatus | undefined;
  upload_statuses?: UploadStatus[] | undefined;
  error?: ComposeStatusError | undefined;
};
export type KojiStatus = {
  build_id?: number | undefined;
};
export type ComposeStatus = ObjectReference & {
  status: ComposeStatusValue;
  image_status: ImageStatus;
  image_statuses?: ImageStatus[] | undefined;
  koji_status?: KojiStatus | undefined;
};
export type Error = ObjectReference & {
  code: string;
  reason: string;
  operation_id: string;
  details?: any | undefined;
};
export type ComposeId = ObjectReference & {
  id: string;
};
export type ImageTypes =
  | "aws"
  | "aws-ha-rhui"
  | "aws-rhui"
  | "aws-sap-rhui"
  | "azure"
  | "azure-cvm"
  | "azure-eap7-rhui"
  | "azure-rhui"
  | "azure-sap-rhui"
  | "edge-commit"
  | "edge-container"
  | "edge-installer"
  | "gcp"
  | "gcp-rhui"
  | "guest-image"
  | "image-installer"
  | "iot-bootable-container"
  | "iot-commit"
  | "iot-container"
  | "iot-installer"
  | "iot-raw-image"
  | "iot-simplified-installer"
  | "live-installer"
  | "minimal-raw"
  | "oci"
  | "vsphere"
  | "vsphere-ova"
  | "wsl";
export type Repository = {
  /** Determines whether a valid subscription is required to access this repository. */
  rhsm?: boolean | undefined;
  baseurl?: string | undefined;
  mirrorlist?: string | undefined;
  metalink?: string | undefined;
  /** GPG key used to sign packages in this repository. */
  gpgkey?: string | undefined;
  check_gpg?: boolean | undefined;
  /** Enables gpg verification of the repository metadata
   */
  check_repo_gpg?: boolean | undefined;
  ignore_ssl?: boolean | undefined;
  /** Disables modularity filtering for this repository.
   */
  module_hotfixes?: boolean | undefined;
  /** Naming package sets for a repository assigns it to a specific part
    (pipeline) of the build process.
     */
  package_sets?: string[] | undefined;
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
export type Awsec2UploadOptions = {
  region: string;
  snapshot_name?: string | undefined;
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
  public?: boolean | undefined;
};
export type GcpUploadOptions = {
  /** The GCP region where the OS image will be imported to and shared from.
    The value must be a valid GCP location. See https://cloud.google.com/storage/docs/locations.
    If not specified, the multi-region location closest to the source
    (source Storage Bucket location) is chosen automatically.
     */
  region: string;
  /** Name of an existing STANDARD Storage class Bucket. */
  bucket?: string | undefined;
  /** The name to use for the imported and shared Compute Engine image.
    The image name must be unique within the GCP project, which is used
    for the OS image upload and import. If not specified a random
    'composer-api-<uuid>' string is used as the image name.
     */
  image_name?: string | undefined;
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
  share_with_accounts?: string[] | undefined;
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
  location?: string | undefined;
  /** Name of the uploaded image. It must be unique in the given resource group.
    If name is omitted from the request, a random one based on a UUID is
    generated.
     */
  image_name?: string | undefined;
  /** Choose the VM Image HyperV generation, different features on Azure are available
    depending on the HyperV generation.
     */
  hyper_v_generation?: ("V1" | "V2") | undefined;
};
export type ContainerUploadOptions = {
  /** Name for the created container image
   */
  name?: string | undefined;
  /** Tag for the created container image
   */
  tag?: string | undefined;
};
export type LocalUploadOptions = {};
export type OciUploadOptions = object;
export type PulpOsTreeUploadOptions = {
  /** Basepath for distributing the repository */
  basepath: string;
  /** Repository to import the ostree commit to */
  repository?: string | undefined;
  server_address?: string | undefined;
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
  ostree?: OsTree | undefined;
  /** The type and options for multiple upload targets. Each item defines
    a separate upload destination with its own options. Multiple
    different targets as well as multiple targets of the same kind are
    supported.
     */
  upload_targets?: UploadTarget[] | undefined;
  /** Top level upload options for a single upload target. If this is
    defined, it is used with the default target type for the image type
    and is combined with the targets defined in upload_targets.
     */
  upload_options?: UploadOptions | undefined;
  /** Size of image, in bytes. When set to 0 the image size is a minimum
    defined by the image type.
     */
  size?: any | undefined;
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
  /** Ensure that the parent directories exist */
  ensure_parents?: boolean | undefined;
};
export type Subscription = {
  organization: string;
  activation_key: string;
  server_url: string;
  base_url: string;
  insights: boolean;
  /** Optional flag to use rhc to register the system, which also always enables Insights.
   */
  rhc?: boolean | undefined;
  /** Optional value to set proxy option when registering the system to Insights
   */
  insights_client_proxy?: string | undefined;
  /** Optional value to register with a template when registering the system with Insights.
   */
  template_uuid?: string | undefined;
  /** Optional value to register with a template when using rhc to register the system with Insights.
   */
  template_name?: string | undefined;
};
export type Module = {
  /** Name of the module to enable.
   */
  name: string;
  /** Stream to enable.
   */
  stream: string;
};
export type User = {
  name: string;
  groups?: string[] | undefined;
  key?: string | undefined;
  /** If the password starts with $6$, $5$, or $2b$ it will be stored as
    an encrypted password. Otherwise it will be treated as a plain text
    password.
     */
  password?: string | undefined;
};
export type CustomRepository = {
  id: string;
  name?: string | undefined;
  filename?: string | undefined;
  baseurl?: string[] | undefined;
  mirrorlist?: string | undefined;
  metalink?: string | undefined;
  enabled?: boolean | undefined;
  gpgkey?: string[] | undefined;
  check_gpg?: boolean | undefined;
  check_repo_gpg?: boolean | undefined;
  ssl_verify?: boolean | undefined;
  priority?: number | undefined;
  module_hotfixes?: boolean | undefined;
};
export type OpenScapTailoring = {
  selected?: string[] | undefined;
  unselected?: string[] | undefined;
};
export type OpenScapjsonTailoring = {
  profile_id: string;
  filepath: string;
};
export type OpenScap = {
  /** Puts a specified policy ID in the RHSM facts, so that any instances registered to
    insights will be automatically connected to the compliance policy in the console.
     */
  policy_id?: string | undefined;
  profile_id: string;
  tailoring?: OpenScapTailoring | undefined;
  json_tailoring?: OpenScapjsonTailoring | undefined;
};
export type Filesystem = {
  mountpoint: string;
  /** size of the filesystem in bytes */
  min_size: any;
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
export type FirewallServices = {
  /** List of services to enable */
  enabled?: string[] | undefined;
  /** List of services to disable */
  disabled?: string[] | undefined;
};
export type FirewallCustomization = {
  /** List of ports (or port ranges) and protocols to open */
  ports?: string[] | undefined;
  services?: FirewallServices | undefined;
};
export type Fdo = {
  manufacturing_server_url?: string | undefined;
  diun_pub_key_insecure?: string | undefined;
  diun_pub_key_hash?: string | undefined;
  diun_pub_key_root_certs?: string | undefined;
  di_mfg_string_type_mac_iface?: string | undefined;
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
  unattended?: boolean | undefined;
  "sudo-nopasswd"?: string[] | undefined;
};
export type ImportKeys = {
  files?: string[] | undefined;
};
export type RpmCustomization = {
  import_keys?: ImportKeys | undefined;
};
export type DnfPluginConfig = {
  enabled?: boolean | undefined;
};
export type SubManDnfPluginsConfig = {
  product_id?: DnfPluginConfig | undefined;
  subscription_manager?: DnfPluginConfig | undefined;
};
export type SubManRhsmConfig = {
  manage_repos?: boolean | undefined;
  auto_enable_yum_plugins?: boolean | undefined;
};
export type SubManRhsmCertdConfig = {
  auto_registration?: boolean | undefined;
};
export type SubManConfig = {
  rhsm?: SubManRhsmConfig | undefined;
  rhsmcertd?: SubManRhsmCertdConfig | undefined;
};
export type RhsmConfig = {
  dnf_plugins?: SubManDnfPluginsConfig | undefined;
  subscription_manager?: SubManConfig | undefined;
};
export type RhsmCustomization = {
  config?: RhsmConfig | undefined;
};
export type CaCertsCustomization = {
  pem_certs: string[];
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
export type Customizations = {
  containers?: Container[] | undefined;
  directories?: Directory[] | undefined;
  files?: File[] | undefined;
  subscription?: Subscription | undefined;
  packages?: string[] | undefined;
  enabled_modules?: Module[] | undefined;
  users?: User[] | undefined;
  /** Extra repositories for packages specified in customizations. These
    repositories will only be used to depsolve and retrieve packages
    for the OS itself (they will not be available for the build root or
    any other part of the build process). The package_sets field for these
    repositories is ignored.
     */
  payload_repositories?: Repository[] | undefined;
  /** Extra repositories for packages specified in customizations. These
    repositories will be used to depsolve and retrieve packages. Additionally,
    these packages will be saved and imported to the `/etc/yum.repos.d/` directory
    on the image
     */
  custom_repositories?: CustomRepository[] | undefined;
  openscap?: OpenScap | undefined;
  filesystem?: Filesystem[] | undefined;
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
  rpm?: RpmCustomization | undefined;
  rhsm?: RhsmCustomization | undefined;
  cacerts?: CaCertsCustomization | undefined;
  disk?: Disk | undefined;
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
  version?: string | undefined;
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
  description?: string | undefined;
  /** If the password starts with $6$, $5$, or $2b$ it will be stored as
    an encrypted password. Otherwise it will be treated as a plain text
    password.
     */
  password?: string | undefined;
  /** ssh public key */
  key?: string | undefined;
  /** The user's home directory */
  home?: string | undefined;
  /** Login shell to use */
  shell?: string | undefined;
  /** A list of additional groups to add the user to */
  groups?: string[] | undefined;
  /** User id to use instead of the default */
  uid?: number | undefined;
  /** Group id to use instead of the default */
  gid?: number | undefined;
};
export type FirewallZones = {
  /** name of the zone, if left empty the sources will apply to
    the default zone.
     */
  name?: string | undefined;
  /** List of sources for the zone */
  sources?: string[] | undefined;
};
export type BlueprintFirewall = {
  /** List of ports (or port ranges) and protocols to open */
  ports?: string[] | undefined;
  services?: FirewallServices | undefined;
  zones?: FirewallZones[] | undefined;
};
export type BlueprintFilesystem = {
  mountpoint: string;
  minsize: Minsize;
};
export type BlueprintOpenScap = {
  /** Puts a specified policy ID in the RHSM facts, so that any instances registered to
    insights will be automatically connected to the compliance policy in the console.
     */
  policy_id?: string | undefined;
  profile_id: string;
  datastream?: string | undefined;
  tailoring?: OpenScapTailoring | undefined;
  json_tailoring?: OpenScapjsonTailoring | undefined;
};
export type BlueprintFile = {
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
};
export type BlueprintRepository = {
  id: string;
  baseurls?: string[] | undefined;
  gpgkeys?: string[] | undefined;
  metalink?: string | undefined;
  mirrorlist?: string | undefined;
  name?: string | undefined;
  priority?: number | undefined;
  enabled?: boolean | undefined;
  gpgcheck?: boolean | undefined;
  repo_gpgcheck?: boolean | undefined;
  sslverify?: boolean | undefined;
  filename?: string | undefined;
  /** Disables modularity filtering for this repository.
   */
  module_hotfixes?: boolean | undefined;
};
export type BlueprintCustomizations = {
  /** Configures the hostname */
  hostname?: string | undefined;
  kernel?: Kernel | undefined;
  /** List of ssh keys */
  sshkey?: SshKey[] | undefined;
  /** List of users to create */
  user?: BlueprintUser[] | undefined;
  /** List of groups to create */
  group?: Group[] | undefined;
  timezone?: Timezone | undefined;
  locale?: Locale | undefined;
  firewall?: BlueprintFirewall | undefined;
  services?: Services | undefined;
  /** List of filesystem mountpoints to create */
  filesystem?: BlueprintFilesystem[] | undefined;
  disk?: Disk | undefined;
  /** Name of the installation device, currently only useful for the edge-simplified-installer type
   */
  installation_device?: string | undefined;
  /** Select how the disk image will be partitioned. 'auto-lvm' will use raw unless
    there are one or more mountpoints in which case it will use LVM. 'lvm' always
    uses LVM, even when there are no extra mountpoints. 'raw' uses raw partitions
    even when there are one or more mountpoints.
     */
  partitioning_mode?: ("raw" | "lvm" | "auto-lvm") | undefined;
  fdo?: Fdo | undefined;
  openscap?: BlueprintOpenScap | undefined;
  ignition?: Ignition | undefined;
  /** Directories to create in the final artifact */
  directories?: Directory[] | undefined;
  /** Files to create in the final artifact */
  files?: BlueprintFile[] | undefined;
  /** Repositories to write to /etc/yum.repos.d/ in the final image. Note
    that these are not used at build time.
     */
  repositories?: BlueprintRepository[] | undefined;
  /** Enable FIPS mode */
  fips?: boolean | undefined;
  installer?: Installer | undefined;
  rpm?: RpmCustomization | undefined;
  rhsm?: RhsmCustomization | undefined;
  cacerts?: CaCertsCustomization | undefined;
};
export type Blueprint = {
  name: string;
  description?: string | undefined;
  /** A semver version number */
  version?: string | undefined;
  /** The distribution to use for the compose. If left empty the host
    distro will be used.
     */
  distro?: string | undefined;
  /** Packages to be installed */
  packages?: Package[] | undefined;
  /** An alias for packages, retained for backwards compatability
   */
  modules?: Package[] | undefined;
  enabled_modules?: Module[] | undefined;
  /** Package groups to be installed */
  groups?: PackageGroup[] | undefined;
  /** Container images to embed into the final artfact */
  containers?: Container[] | undefined;
  customizations?: BlueprintCustomizations | undefined;
};
export type ComposeRequest = {
  distribution: string;
  image_request?: ImageRequest | undefined;
  image_requests?: ImageRequest[] | undefined;
  customizations?: Customizations | undefined;
  koji?: Koji | undefined;
  blueprint?: Blueprint | undefined;
};
