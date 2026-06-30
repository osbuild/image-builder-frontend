import { v4 as uuidv4 } from 'uuid';

import {
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  BlueprintExportResponse,
  BlueprintMetadata,
  BlueprintResponse,
  BtrfsVolume,
  ComposerAwsUploadRequestOptions,
  ComposerCreateBlueprintRequest,
  CreateBlueprintRequest,
  CustomRepository,
  DistributionProfileItem,
  Distributions,
  File,
  Filesystem,
  FilesystemTyped,
  GcpUploadRequestOptions,
  ImageRequest,
  LogicalVolume,
  OpenScapCompliance,
  OpenScapProfile,
  VolumeGroup,
} from '@/store/api/backend';
import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';
import {
  AwsShareMethod,
  ComplianceType,
  DiskPartition,
  FilesystemMode,
  FilesystemPartition,
  GcpAccountType,
  initialState,
  isRhel,
  isSupportedImageType,
  PackageRepository,
  parseSizeUnit,
  parseSystemFromRequest,
  RegistrationType,
  Units,
  WizardState,
} from '@/store/slices/wizard';

import {
  CENTOS_9,
  RHEL_10,
  RHEL_8,
  RHEL_9,
  SATELLITE_PATH,
} from '../../../constants';

const convertFilesystemToPartition = (
  filesystem: Filesystem,
): FilesystemPartition => {
  const id = uuidv4();
  const [size, unit] = parseSizeUnit(filesystem.min_size);
  const partition = {
    mountpoint: filesystem.mountpoint,
    min_size: size,
    id: id,
    unit: unit as Units,
  };
  return partition;
};

const convertDiskToFscDisk = (
  disk: FilesystemTyped | VolumeGroup | BtrfsVolume,
): DiskPartition => {
  const id = uuidv4();
  let size;
  let unit;

  if (disk.minsize) {
    [size, unit] = disk.minsize && disk.minsize.split(' ');
  }

  if ('logical_volumes' in disk) {
    return {
      id: id,
      min_size: size,
      unit: (unit || 'GiB') as Units,
      name: disk.name,
      type: disk.type,
      logical_volumes: disk.logical_volumes.map((lv) =>
        convertLogicalVolume(lv),
      ),
    };
  }

  if ('subvolumes' in disk) {
    return {
      id: id,
      min_size: size,
      unit: unit as Units,
      type: disk.type,
      subvolumes: disk.subvolumes,
    };
  }

  return {
    id: id,
    fs_type: disk.fs_type,
    mountpoint: disk.mountpoint,
    min_size: size,
    unit: (unit || 'GiB') as Units,
    type: disk.type,
  };
};

const convertLogicalVolume = (volume: LogicalVolume) => {
  const id = uuidv4();
  let size;
  let unit;

  if (volume.minsize) {
    [size, unit] = volume.minsize && volume.minsize.split(' ');
  }

  return {
    id: id,
    min_size: size,
    unit: (unit || 'GiB') as Units,
    name: volume.name,
    fs_type: volume.fs_type,
    mountpoint: volume.mountpoint,
  };
};

/**
 * This function overwrites distribution of the blueprints with the major release
 * and deprecated CentOS 8 with CentOS 9
 * Minor releases were previously used and are still present in older blueprints
 * @param distribution blueprint distribution
 */
const getLatestRelease = (
  distribution: Distributions | undefined,
): Distributions | undefined => {
  if (distribution === undefined) {
    return undefined;
  }

  return distribution.startsWith('rhel-10')
    ? RHEL_10
    : distribution.startsWith('rhel-9')
      ? RHEL_9
      : distribution.startsWith('rhel-8')
        ? RHEL_8
        : distribution === ('centos-8' as Distributions)
          ? CENTOS_9
          : distribution;
};

const azureTargetOptions = (options: AzureUploadRequestOptions) => {
  // there is a mismatch between API type and real data
  // this check allows removing optional chaining from the rest of the code
  // and disabling ESLint rule only in one place
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!options) {
    return {
      tenantId: undefined,
      subscriptionId: undefined,
      resourceGroup: undefined,
      hyperVGeneration: 'V1' as const,
    };
  }

  const resourceGroupIsDefined =
    options.resource_group && options.resource_group !== '';
  const subscriptionIdIsDefined =
    options.subscription_id && options.subscription_id !== '';
  const tenandIdIsDefined = options.tenant_id && options.tenant_id !== '';

  const isAnyDefined =
    resourceGroupIsDefined || subscriptionIdIsDefined || tenandIdIsDefined;

  if (isAnyDefined) {
    // Edge case but if one field is selected, that means that azure was chosen at some point,
    // and we should show an error for other missing fields
    return {
      tenantId: options.tenant_id || '',
      subscriptionId: options.subscription_id || '',
      resourceGroup: options.resource_group || '',
      hyperVGeneration: options.hyper_v_generation || 'V1',
    };
  } else {
    return {
      tenantId: undefined,
      subscriptionId: undefined,
      resourceGroup: undefined,
      hyperVGeneration: options.hyper_v_generation || 'V1',
    };
  }
};

const gcpTargetOptions = (options: GcpUploadRequestOptions) => {
  if (
    // there is a mismatch between API type and real data
    // this check allows removing optional chaining from the rest of the code
    // and disabling ESLint rule only in one place
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !options ||
    !options.share_with_accounts ||
    options.share_with_accounts.length === 0
  ) {
    return {
      accountType: undefined as GcpAccountType | undefined,
      email: '',
    };
  }

  const [accountType, email] = options.share_with_accounts[0].split(':');

  return {
    accountType: accountType as GcpAccountType,
    email: email || '',
  };
};

const awsTargetOptions = (
  options: AwsUploadRequestOptions | ComposerAwsUploadRequestOptions,
) => {
  // there is a mismatch between API type and real data
  // this check allows removing optional chaining from the rest of the code
  // and disabling ESLint rule only in one place
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!options) {
    return {
      accountId: '',
      shareMethod: 'manual' as AwsShareMethod,
      source: { id: undefined },
      sourceId: undefined,
      region: undefined,
    };
  }

  return {
    accountId: options.share_with_accounts?.[0] || '',
    shareMethod: (options.share_with_sources
      ? 'sources'
      : 'manual') as AwsShareMethod,
    source: { id: options.share_with_sources?.[0] },
    sourceId: options.share_with_sources?.[0],
    region: 'region' in options ? options.region : undefined,
  };
};

function commonRequestToState(
  request:
    | BlueprintResponse
    | CreateBlueprintRequest
    | ComposerCreateBlueprintRequest,
) {
  const gcp = request.image_requests.find(
    (image) => image.image_type === 'gcp',
  );
  const aws = request.image_requests.find(
    (image) => image.image_type === 'aws',
  );

  const azure = request.image_requests.find(
    (image) => image.image_type === 'azure',
  );

  const snapshotDateFromRequest =
    request.image_requests.find((image) => !!image.snapshot_date)
      ?.snapshot_date || '';
  let snapshot_date = '';

  // Previously DateOnly format of the snapshot date was used (YYYY-MM-DD),
  // meaning this is a format that can be present in already existing blueprints.
  // Currently used format is RFC3339 (YYYY-MM-DDTHH:MM:SSZ), this condition
  // checks which format is getting parsed and converts DateOnly to RFC3339
  // when necessary.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(snapshotDateFromRequest)) {
    snapshot_date = snapshotDateFromRequest;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(snapshotDateFromRequest)) {
    snapshot_date = snapshotDateFromRequest + 'T00:00:00Z';
  } else {
    snapshot_date = '';
  }

  // we need to check for the region for on-prem
  const awsUploadOptions = aws?.upload_request
    .options as AwsUploadRequestOptions & { region?: string | undefined };
  const gcpUploadOptions = gcp?.upload_request
    .options as GcpUploadRequestOptions;
  const azureUploadOptions = azure?.upload_request
    .options as AzureUploadRequestOptions;

  const arch =
    request.image_requests[0]?.architecture ?? initialState.output.architecture;
  if (!['x86_64', 'aarch64'].includes(arch)) {
    throw new Error(`image type: ${arch} has no implementation yet`);
  }

  let oscapProfile = undefined;
  let compliancePolicyID = undefined;
  if (request.customizations.openscap) {
    const oscapAsProfile = request.customizations.openscap as OpenScapProfile;
    if (oscapAsProfile.profile_id !== '') {
      oscapProfile = oscapAsProfile.profile_id as DistributionProfileItem;
    }
    const oscapAsCompliance = request.customizations
      .openscap as OpenScapCompliance;
    if (oscapAsCompliance.policy_id !== '') {
      compliancePolicyID = oscapAsCompliance.policy_id;
    }
  }

  const rawPackageNames =
    request.customizations.packages?.filter((pkg) => !pkg.startsWith('@')) ??
    [];
  const localeLangpacks = rawPackageNames.filter((p) =>
    /^langpacks-[a-z]+$/.test(p),
  );
  const otherPackageNames = rawPackageNames.filter(
    (p) => !/^langpacks-[a-z]+$/.test(p),
  );

  return {
    details: {
      mode: 'create' as const,
      blueprint: {
        name: request.name || '',
        isCustomName: true,
        description: request.description || '',
        mode: 'package' as const,
      },
    },
    compliance:
      compliancePolicyID !== undefined
        ? {
            type: 'compliance' as ComplianceType,
            policyID: compliancePolicyID,
            profileID: undefined,
            policyTitle: undefined,
            fips: {
              enabled: request.customizations.fips?.enabled || false,
            },
          }
        : oscapProfile !== undefined
          ? {
              type: 'openscap' as ComplianceType,
              profileID: oscapProfile,
              policyID: undefined,
              policyTitle: undefined,
              fips: {
                enabled: request.customizations.fips?.enabled || false,
              },
            }
          : {
              ...initialState.compliance,
              fips: {
                enabled: request.customizations.fips?.enabled || false,
              },
            },
    filesystem: {
      mode: request.customizations.filesystem
        ? ('basic' as FilesystemMode)
        : request.customizations.disk
          ? ('advanced' as FilesystemMode)
          : ('automatic' as FilesystemMode),
      disk: request.customizations.disk
        ? (() => {
            const [size, unit] =
              request.customizations.disk.minsize?.split(' ') || [];
            return {
              type: request.customizations.disk.type || undefined,
              minsize: size || '',
              unit: (unit || 'GiB') as Units,
              partitions: request.customizations.disk.partitions.map((d) =>
                convertDiskToFscDisk(d),
              ),
            };
          })()
        : {
            minsize: '',
            unit: 'GiB' as Units,
            partitions: [],
            type: undefined,
          },
      fileSystem: request.customizations.filesystem
        ? {
            partitions: request.customizations.filesystem.map((fs) =>
              convertFilesystemToPartition(fs),
            ),
          }
        : {
            partitions: [],
          },
      partitioningMode: request.customizations.partitioning_mode,
    },
    output: {
      architecture: arch,
      // Legacy on-prem bootc blueprints may have undefined distribution.
      // Fall back to initialState so the wizard state type stays satisfied;
      // the user can pick the correct distro in the wizard.
      distribution:
        getLatestRelease(request.distribution) ??
        initialState.output.distribution,
      imageSource: 'bootc' in request ? request.bootc?.reference : undefined,
      isoPayloadReference: request.bootc?.iso_payload_reference,
      // Edge types are managed by a separate workflow; exclude them from this wizard
      imageTypes: request.image_requests
        .map((image) => image.image_type)
        .filter(isSupportedImageType),
      bootcDistributions: [],
    },
    cloudProviders: {
      azure: azureTargetOptions(azureUploadOptions),
      gcp: gcpTargetOptions(gcpUploadOptions),
      aws: awsTargetOptions(awsUploadOptions),
    },
    content: {
      repositories: {
        customRepositories: request.customizations.custom_repositories || [],
        payloadRepositories: request.customizations.payload_repositories || [],
        recommendedRepositories: [],
        redHatRepositories: [],
      },
      packages: otherPackageNames.map((pkg) => ({
        name: pkg,
        summary: '',
        repository: '' as PackageRepository,
      })),
      enabledModules: request.customizations.enabled_modules || [],
      groups:
        request.customizations.packages
          ?.filter((grp) => grp.startsWith('@'))
          .map((grp) => ({
            name: grp.substr(1),
            description: '',
            repository: '' as PackageRepository,
            package_list: [],
          })) || [],
      snapshotting: {
        useLatest:
          !snapshot_date && !request.image_requests[0]?.content_template,
        snapshotDate: snapshot_date,
        template: request.image_requests[0]?.content_template || '',
        templateName: request.image_requests[0]?.content_template_name || '',
      },
      verifiedLocaleLangpacks: localeLangpacks,
    },
  };
}

/**
 * This function maps the blueprint response to the wizard state, used to populate the wizard with the blueprint details
 * @param request BlueprintResponse
 * @param source  V1ListSourceResponseItem
 * @returns WizardState
 */
export const mapRequestToState = (request: BlueprintResponse): WizardState => {
  const commonState = commonRequestToState(request);
  return {
    ...commonState,
    details: {
      ...commonState.details,
      blueprintId: request.id,
      mode: 'edit',
      blueprint: {
        ...commonState.details.blueprint,
        mode: request.bootc ? 'image' : 'package',
      },
    },
    system: parseSystemFromRequest(request),
    registration: {
      serverUrl: request.customizations.subscription?.['server-url'] || '',
      baseUrl: request.customizations.subscription?.['base-url'] || '',
      proxy: request.customizations.subscription?.insights_client_proxy,
      type: getRegistrationType(request),
      activationKey: isRhel(request.distribution)
        ? request.customizations.subscription?.['activation-key']
        : undefined,
      orgId: isRhel(request.distribution)
        ? request.customizations.subscription?.['organization']?.toString()
        : undefined,
      satelliteRegistration: {
        command: getSatelliteCommand(request.customizations.files),
        caCert: request.customizations.cacerts?.pem_certs[0],
      },
      aap: {
        enabled: request.customizations.aap_registration !== undefined,
        callbackUrl:
          request.customizations.aap_registration?.ansible_callback_url,
        hostConfigKey: request.customizations.aap_registration?.host_config_key,
        tlsCertificateAuthority:
          request.customizations.aap_registration?.tls_certificate_authority,
        skipTlsVerification:
          request.customizations.aap_registration?.skip_tls_verification,
      },
    },
  };
};

export function mapToCustomRepositories(
  repo: ApiRepositoryImportResponseRead | ApiRepositoryResponseRead,
): CustomRepository[] {
  if (!repo.uuid) return [];
  return [
    {
      id: repo.uuid,
      name: repo.name,
      baseurl: repo.url ? [repo.url] : undefined,
      gpgkey: repo.gpg_key ? [repo.gpg_key] : undefined,
      check_gpg: repo.metadata_verification ?? undefined,
      check_repo_gpg: repo.metadata_verification ?? undefined,
      module_hotfixes: repo.module_hotfixes ?? undefined,
      enabled: true,
    },
  ];
}

const getMetadata = (metadata: BlueprintMetadata) => {
  // there is a mismatch between API type and real data
  // this check allows removing optional chaining from the rest of the code
  // and disabling ESLint rule only in one place
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!metadata) {
    return {
      parent_id: null,
      exported_at: '',
      is_on_prem: false,
    };
  }

  return {
    parent_id: metadata.parent_id || null,
    exported_at: metadata.exported_at || '',
    is_on_prem: metadata.is_on_prem || false,
  };
};

/**
 * Maps a BlueprintExportResponse to the wizard state, used to populate the wizard when importing a blueprint.
 */
export const mapBlueprintExportToState = (
  blueprint: BlueprintExportResponse,
  image_requests: ImageRequest[],
): WizardState => {
  const blueprintResponse: CreateBlueprintRequest = {
    name: blueprint.name,
    description: blueprint.description,
    distribution: blueprint.distribution,
    customizations: blueprint.customizations,
    image_requests: image_requests,
    bootc: blueprint.bootc,
  };

  const commonState = commonRequestToState(blueprintResponse);

  let snapshotting = commonState.content.snapshotting;
  if (
    blueprint.snapshot_date &&
    !commonState.content.snapshotting.snapshotDate
  ) {
    let normalizedDate = '';
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(blueprint.snapshot_date)) {
      normalizedDate = blueprint.snapshot_date;
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(blueprint.snapshot_date)) {
      normalizedDate = blueprint.snapshot_date + 'T00:00:00Z';
    }
    if (normalizedDate) {
      snapshotting = {
        useLatest: false,
        snapshotDate: normalizedDate,
        template: '',
        templateName: '',
      };
    }
  }

  return {
    ...commonState,
    details: {
      ...commonState.details,
      mode: 'create',
      blueprint: {
        ...commonState.details.blueprint,
        mode: blueprint.bootc ? 'image' : 'package',
      },
      metadata: getMetadata(blueprint.metadata),
    },
    system: parseSystemFromRequest(blueprint),
    registration: {
      ...initialState.registration,
      aap: {
        enabled: blueprint.customizations.aap_registration !== undefined,
        callbackUrl:
          blueprint.customizations.aap_registration?.ansible_callback_url,
        hostConfigKey:
          blueprint.customizations.aap_registration?.host_config_key,
        tlsCertificateAuthority:
          blueprint.customizations.aap_registration?.tls_certificate_authority,
        skipTlsVerification:
          blueprint.customizations.aap_registration?.skip_tls_verification,
      },
    },
    content: {
      ...commonState.content,
      snapshotting,
    },
  };
};

const getRegistrationType = (
  request:
    | BlueprintResponse
    | CreateBlueprintRequest
    | ComposerCreateBlueprintRequest,
): RegistrationType => {
  const subscription = request.customizations.subscription;
  const distribution = request.distribution;
  const files = request.customizations.files;

  if (subscription && isRhel(distribution)) {
    if (subscription.rhc) {
      return 'register-now-rhc';
    } else {
      return 'register-now-insights';
    }
  } else if (getSatelliteCommand(files)) {
    return 'register-satellite';
  } else {
    return 'register-later';
  }
};

const getSatelliteCommand = (files?: File[]): string => {
  const satelliteCommandFile = files?.find(
    (file) => file.path === SATELLITE_PATH,
  );
  return satelliteCommandFile?.data ? atob(satelliteCommandFile.data) : '';
};
