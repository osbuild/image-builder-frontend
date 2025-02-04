import {
  BlueprintExportResponse,
  Container,
  CreateBlueprintRequest,
  Directory,
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

export type CustomizationsOnPrem = {
  directories?: Directory[];
  files?: File[];
  repositories?: CustomRepositoryOnPrem[];
  openscap?: OpenScap;
  filesystem?: FileSystemOnPrem[];
  services?: Services;
  ssh_key?: SshKeyOnPrem[];
  hostname?: string;
  kernel?: Kernel;
  user?: UserOnPrem[];
  groups?: GroupOnPrem[];
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

export type UserOnPrem = {
  name: string;
  key: string;
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

export const mapOnPremToHosted = (
  blueprint: BlueprintOnPrem
): BlueprintExportResponse => {
  const users = blueprint.customizations?.user?.map((u) => ({
    name: u.name,
    ssh_key: u.key,
    groups: u.groups,
    isAdministrator: u.groups?.includes('wheel') || false,
  }));
  const user_keys = blueprint.customizations?.ssh_key?.map((k) => ({
    name: k.user,
    ssh_key: k.key,
  }));
  const packages =
    blueprint.packages !== undefined
      ? blueprint.packages.map((p) => p.name)
      : undefined;
  const groups =
    blueprint.customizations?.groups !== undefined
      ? blueprint.customizations.groups.map((p) => `@${p.name}`)
      : undefined;
  return {
    name: blueprint.name,
    description: blueprint.description || '',
    distribution: blueprint.distro!,
    customizations: {
      ...blueprint.customizations,
      containers: blueprint.containers,
      custom_repositories: blueprint.customizations?.repositories?.map(
        ({ baseurls, ...fs }) => ({
          baseurl: baseurls,
          ...fs,
        })
      ),
      packages:
        packages !== undefined || groups !== undefined
          ? [...(packages ? packages : []), ...(groups ? groups : [])]
          : undefined,
      users:
        users !== undefined || user_keys !== undefined
          ? [...(users ? users : []), ...(user_keys ? user_keys : [])]
          : undefined,
      groups: blueprint.customizations?.groups,
      filesystem: blueprint.customizations?.filesystem?.map(
        ({ minsize, ...fs }) => ({
          min_size: minsize,
          ...fs,
        })
      ),
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
    },
    metadata: {
      parent_id: null,
      exported_at: '',
      is_on_prem: true,
    },
  };
};

export const mapHostedToOnPrem = (
  blueprint: CreateBlueprintRequest
): BlueprintOnPrem => {
  const result: BlueprintOnPrem = {
    name: blueprint.name,
    customizations: {},
  };

  if (blueprint.customizations?.packages) {
    result.packages = blueprint.customizations.packages.map((pkg) => {
      return {
        name: pkg,
        version: '*',
      };
    });
  }

  if (blueprint.customizations?.containers) {
    result.containers = blueprint.customizations.containers;
  }

  if (blueprint.customizations?.directories) {
    result.customizations!.directories = blueprint.customizations.directories;
  }

  if (blueprint.customizations?.files) {
    result.customizations!.files = blueprint.customizations.files;
  }

  if (blueprint.customizations?.openscap) {
    result.customizations!.openscap = blueprint.customizations.openscap;
  }

  if (blueprint.customizations?.filesystem) {
    result.customizations!.filesystem = blueprint.customizations.filesystem.map(
      (fs) => {
        return {
          mountpoint: fs.mountpoint,
          minsize: fs.min_size,
        };
      }
    );
  }

  if (blueprint.customizations?.users) {
    result.customizations!.user = blueprint.customizations.users.map((u) => {
      return {
        name: u.name,
        key: u.ssh_key || '',
        groups: u.groups || [],
        isAdministrator: u.groups?.includes('wheel') || false,
      };
    });
  }

  if (blueprint.customizations?.services) {
    result.customizations!.services = blueprint.customizations.services;
  }

  if (blueprint.customizations?.hostname) {
    result.customizations!.hostname = blueprint.customizations.hostname;
  }

  if (blueprint.customizations?.kernel) {
    result.customizations!.kernel = blueprint.customizations.kernel;
  }

  if (blueprint.customizations?.groups) {
    result.customizations!.groups = blueprint.customizations.groups.map((g) => {
      return {
        name: g.name,
        gid: g.gid,
      };
    });
  }

  if (blueprint.customizations?.timezone) {
    result.customizations!.timezone = blueprint.customizations.timezone;
  }

  if (blueprint.customizations?.locale) {
    result.customizations!.locale = blueprint.customizations.locale;
  }

  if (blueprint.customizations?.firewall) {
    result.customizations!.firewall = blueprint.customizations.firewall;
  }

  if (blueprint.customizations?.installation_device) {
    result.customizations!.installation_device =
      blueprint.customizations.installation_device;
  }

  if (blueprint.customizations?.fdo) {
    result.customizations!.fdo = blueprint.customizations.fdo;
  }

  if (blueprint.customizations?.ignition) {
    result.customizations!.ignition = blueprint.customizations.ignition;
  }

  if (blueprint.customizations?.partitioning_mode) {
    result.customizations!.partitioning_mode =
      blueprint.customizations.partitioning_mode;
  }

  if (blueprint.customizations?.fips) {
    result.customizations!.fips =
      blueprint.customizations.fips?.enabled || false;
  }

  if (blueprint.customizations?.installer) {
    result.customizations!.installer = blueprint.customizations.installer;
  }

  return result;
};
