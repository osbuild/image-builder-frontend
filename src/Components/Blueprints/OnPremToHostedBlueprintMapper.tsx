import { BlueprintExportResponse, Container, CustomRepository, Directory, Distributions, Fdo, Filesystem, FirewallCustomization, Ignition, Installer, Kernel, Locale, OpenScap, Services, Timezone } from '../../store/imageBuilderApi';

export type BlueprintOnPrem = {
    name: string;
    description?: string;
    packages?: PackagesOnPrem[];
    groups?: GroupsPackagesOnPrem[];
    distro: Distributions;
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

  export type CustomizationsOnPrem = {
    directories?: Directory[];
    files?: File[];
    repositories?: CustomRepository[];
    openscap?: OpenScap;
    filesystem?: Filesystem[];
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
    partitioning_mode?: "raw" | "lvm" | "auto-lvm";
    fips?: boolean;
    installer?: Installer;
  }


  export type UserOnPrem = {
    name: string;
    key: string;
  }

  export type GroupOnPrem = {
    name: string;
    gid: number;
  }

  export type SshKeyOnPrem = {
    user: string;
    key: string;
  }

  export const mapOnPremToHosted = (
    blueprint: BlueprintOnPrem,
  ): BlueprintExportResponse => {
    const users = blueprint.customizations?.user?.map((u) =>
      (
        {
          name: u.name,
          ssh_key: u.key,
        }
      )
    );
    const user_keys = blueprint.customizations?.ssh_key?.map((k) =>
      (
        {
          name: k.user,
          ssh_key: k.key,
        }
      )
    );
    const packages = blueprint.packages !== undefined ? blueprint.packages.map((p) => p.name) : undefined
    const groups = blueprint.customizations?.groups !== undefined
    ? blueprint.customizations.groups.map(p => `@${p.name}`)
    : undefined;
    return {
    name: blueprint.name,
    description: blueprint.description || "",
    distribution: blueprint.distro,
    ...blueprint.customizations,
    customizations: {
      containers: blueprint.containers,
      custom_repositories: blueprint.customizations?.repositories,
      packages: (packages !== undefined || groups !== undefined)
      ? [
          ...(packages ? packages : []),
          ...(groups ? groups : [])
        ]
      : undefined,
      users: (users !== undefined || user_keys !== undefined)
      ? [
          ...(users ? users : []),
          ...(user_keys ? user_keys : [])
        ]
      : undefined,
      groups: blueprint.customizations?.groups,
      fips: blueprint.customizations?.fips !== undefined ? {
        enabled: blueprint.customizations?.fips,
      } : undefined,
    },
  };
}
