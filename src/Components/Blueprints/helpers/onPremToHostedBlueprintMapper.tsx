import { RHEL_10 } from '../../../constants';
import { Blueprint as CloudApiBlueprint } from '../../../store/cockpit/composerCloudApi';
import {
  BlueprintExportResponse,
  Container,
  CreateBlueprintRequest,
  Directory,
  Disk,
  Distributions,
  Fdo,
  File,
  FirewallCustomization,
  Ignition,
  Installer,
  Kernel,
  Locale,
  OpenScap,
  Services,
  Timezone,
} from '../../../store/imageBuilderApi';
import { getHostDistro } from '../../../Utilities/getHostInfo';

// Blueprint as defined by the osbuild-composer cloudapi's /compose
// endpoint.

export type BlueprintOnPrem = {
  name: string;
  description?: string;
  packages?: PackagesOnPrem[];
  groups?: GroupsPackagesOnPrem[];
  distro?: Distributions;
  customizations?: CustomizationsOnPrem;
  containers?: Container[];
};

export type PackagesOnPrem = {
  name: string;
  version?: string;
};

export type GroupsPackagesOnPrem = {
  name: string;
};

export type FileSystemOnPrem = {
  mountpoint: string;
  minsize: number | undefined;
  // size is still accepted for backwards compatibility
  size: number | undefined;
};

export type CustomRepositoryOnPrem = {
  id: string;
  name?: string;
  filename?: string;
  baseurls?: string[];
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

// Base customizations without groups to avoid dual field conflict
export type CustomizationsOnPremBase = {
  directories?: Directory[];
  files?: File[];
  repositories?: CustomRepositoryOnPrem[];
  openscap?: OpenScap;
  filesystem?: FileSystemOnPrem[];
  disk?: Disk;
  services?: Services;
  sshkey?: SshKeyOnPrem[];
  hostname?: string;
  kernel?: Kernel;
  user?: UserOnPrem[];
  timezone?: Timezone;
  locale?: Locale;
  firewall?: FirewallCustomization;
  installation_device?: string;
  fdo?: Fdo;
  ignition?: Ignition;
  partitioning_mode?: 'raw' | 'lvm' | 'auto-lvm';
  fips?: boolean;
  installer?: Installer;
};

// TOML format uses singular 'group' for array of groups: [[customizations.group]]
export type CustomizationsOnPremToml = CustomizationsOnPremBase & {
  group?: GroupOnPrem[];
  groups?: never;
};

// Hosted format uses plural 'groups'
export type CustomizationsOnPremHosted = CustomizationsOnPremBase & {
  group?: never;
  groups?: GroupOnPrem[];
};

// Union type for dual format support during transition
export type CustomizationsOnPrem =
  | CustomizationsOnPremToml
  | CustomizationsOnPremHosted;

export type UserOnPrem = {
  name: string;
  key: string;
  password: string;
  groups: string[];
};

export type GroupOnPrem = {
  name: string;
  gid: number | undefined;
};

export type SshKeyOnPrem = {
  user: string;
  key: string;
};

// Utility function to extract groups from either TOML or hosted format
export const getGroupsFromCustomizations = (
  customizations?: CustomizationsOnPrem,
): GroupOnPrem[] | undefined => {
  if (!customizations) return undefined;
  // Type-safe access to either groups (hosted) or group (TOML) field
  return 'groups' in customizations
    ? customizations.groups
    : 'group' in customizations
      ? customizations.group
      : undefined;
};

export const mapOnPremToHosted = async (
  blueprint: BlueprintOnPrem,
): Promise<BlueprintExportResponse> => {
  const users = blueprint.customizations?.user?.map((u) => ({
    name: u.name,
    ssh_key: u.key,
    groups: u.groups,
    isAdministrator: u.groups.includes('wheel') || false,
  }));
  const user_keys = blueprint.customizations?.sshkey?.map((k) => ({
    name: k.user,
    ssh_key: k.key,
  }));
  const packages =
    blueprint.packages !== undefined
      ? blueprint.packages.map((p) => p.name)
      : undefined;
  // Note: blueprint.groups refers to package groups (e.g., @development-tools),
  // not user groups. User groups are in customizations.groups (see below).
  const packageGroups =
    blueprint.groups !== undefined
      ? blueprint.groups.map((p) => `@${p.name}`)
      : undefined;
  const distro = process.env.IS_ON_PREMISE
    ? await getHostDistro()
    : blueprint.distro || RHEL_10;
  return {
    name: blueprint.name,
    description: blueprint.description || '',
    distribution: distro,
    customizations: {
      ...blueprint.customizations,
      containers: blueprint.containers,
      custom_repositories: blueprint.customizations?.repositories?.map(
        ({ baseurls, ...fs }) => ({
          baseurl: baseurls,
          ...fs,
        }),
      ),
      packages:
        packages !== undefined || packageGroups !== undefined
          ? [
              ...(packages ? packages : []),
              ...(packageGroups ? packageGroups : []),
            ]
          : undefined,
      users:
        users !== undefined || user_keys !== undefined
          ? [...(users ? users : []), ...(user_keys ? user_keys : [])]
          : undefined,
      // Handle both 'group' (TOML format) and 'groups' (existing format) fields
      groups: getGroupsFromCustomizations(blueprint.customizations)?.map(
        (grp: GroupOnPrem) => ({
          name: grp.name,
          ...(grp.gid !== undefined && { gid: grp.gid }),
        }),
      ),
      filesystem: blueprint.customizations?.filesystem?.map(
        ({ minsize, size, ...fs }) => ({
          min_size: minsize || size,
          ...fs,
        }),
      ),
      disk: blueprint.customizations?.disk || undefined,
      fips:
        blueprint.customizations?.fips !== undefined
          ? {
              enabled: blueprint.customizations.fips,
            }
          : undefined,
      timezone:
        blueprint.customizations?.timezone !== undefined
          ? {
              timezone: blueprint.customizations.timezone.timezone,
              ntpservers: blueprint.customizations.timezone.ntpservers,
            }
          : undefined,
      locale:
        blueprint.customizations?.locale !== undefined
          ? {
              languages: blueprint.customizations.locale.languages,
              keyboard: blueprint.customizations.locale.keyboard,
            }
          : undefined,
      hostname: blueprint.customizations?.hostname || undefined,
      kernel:
        blueprint.customizations?.kernel !== undefined
          ? {
              name: blueprint.customizations.kernel.name,
              append: blueprint.customizations.kernel.append,
            }
          : undefined,
      firewall: blueprint.customizations?.firewall || undefined,
      services: blueprint.customizations?.services || undefined,
    },
    metadata: {
      parent_id: null,
      exported_at: '',
      is_on_prem: true,
    },
  };
};

export const mapHostedToOnPrem = (
  blueprint: CreateBlueprintRequest,
): CloudApiBlueprint => {
  const result: CloudApiBlueprint = {
    name: blueprint.name,
    customizations: {},
  };

  if (blueprint.customizations.packages) {
    result.packages = blueprint.customizations.packages.map((pkg) => {
      return {
        name: pkg,
        version: '*',
      };
    });
  }

  if (blueprint.customizations.containers) {
    result.containers = blueprint.customizations.containers;
  }

  // Build customizations object with groups before users to match UI order
  // (groups are prerequisite for user assignment)
  const customizations: typeof result.customizations = {};

  if (blueprint.customizations.directories) {
    customizations.directories = blueprint.customizations.directories;
  }

  if (blueprint.customizations.files) {
    customizations.files = blueprint.customizations.files;
  }

  if (blueprint.customizations.filesystem) {
    customizations.filesystem = blueprint.customizations.filesystem.map(
      (fs) => {
        return {
          mountpoint: fs.mountpoint,
          minsize: fs.min_size,
        };
      },
    );
  }

  if (blueprint.customizations.disk) {
    customizations.disk = blueprint.customizations.disk;
  }

  // Set groups before users to match UI order (groups are prerequisite for user assignment)
  if (blueprint.customizations.groups) {
    customizations.group = blueprint.customizations.groups;
  }

  if (blueprint.customizations.users) {
    customizations.user = blueprint.customizations.users.map((u) => {
      return {
        name: u.name,
        key: u.ssh_key || '',
        groups: u.groups || [],
        password: u.password || '',
      };
    });
  }

  if (blueprint.customizations.services) {
    customizations.services = blueprint.customizations.services;
  }

  if (blueprint.customizations.hostname) {
    customizations.hostname = blueprint.customizations.hostname;
  }

  if (blueprint.customizations.kernel) {
    customizations.kernel = blueprint.customizations.kernel;
  }

  if (blueprint.customizations.timezone) {
    customizations.timezone = blueprint.customizations.timezone;
  }

  if (blueprint.customizations.locale) {
    customizations.locale = blueprint.customizations.locale;
  }

  if (blueprint.customizations.firewall) {
    customizations.firewall = blueprint.customizations.firewall;
  }

  if (blueprint.customizations.installation_device) {
    customizations.installation_device =
      blueprint.customizations.installation_device;
  }

  if (blueprint.customizations.fdo) {
    customizations.fdo = blueprint.customizations.fdo;
  }

  if (blueprint.customizations.ignition) {
    customizations.ignition = blueprint.customizations.ignition;
  }

  if (blueprint.customizations.partitioning_mode) {
    customizations.partitioning_mode =
      blueprint.customizations.partitioning_mode;
  }

  if (blueprint.customizations.fips) {
    customizations.fips = blueprint.customizations.fips.enabled || false;
  }

  if (blueprint.customizations.installer) {
    customizations.installer = blueprint.customizations.installer;
  }

  result.customizations = customizations;

  return result;
};
