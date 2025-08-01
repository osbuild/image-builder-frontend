import { Store } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { parseSizeUnit } from './parseSizeUnit';

import {
  CENTOS_9,
  FIRST_BOOT_SERVICE_DATA,
  FIRSTBOOT_PATH,
  FIRSTBOOT_SERVICE_PATH,
  RHEL_10,
  RHEL_8,
  RHEL_9,
  SATELLITE_PATH,
  SATELLITE_SERVICE_DATA,
  SATELLITE_SERVICE_PATH,
} from '../../../constants';
import { RootState } from '../../../store';
import {
  CockpitAwsUploadRequestOptions,
  CockpitCreateBlueprintRequest,
  CockpitImageRequest,
  CockpitUploadTypes,
} from '../../../store/cockpit/types';
import {
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  BlueprintExportResponse,
  BlueprintResponse,
  CreateBlueprintRequest,
  Customizations,
  CustomRepository,
  DistributionProfileItem,
  Distributions,
  File,
  Filesystem,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
  OpenScap,
  OpenScapCompliance,
  OpenScapProfile,
  Services,
  Subscription,
  UploadTypes,
  User,
} from '../../../store/imageBuilderApi';
import { ApiRepositoryImportResponseRead } from '../../../store/service/contentSourcesApi';
import {
  ComplianceType,
  initialState,
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsRegion,
  selectAwsShareMethod,
  selectAwsSourceId,
  selectAzureHyperVGeneration,
  selectAzureResourceGroup,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectBaseUrl,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCompliancePolicyID,
  selectComplianceProfileID,
  selectComplianceType,
  selectCustomRepositories,
  selectDistribution,
  selectFileSystemConfigurationType,
  selectFirewall,
  selectFirstBootScript,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectGroups,
  selectHostname,
  selectImageTypes,
  selectKernel,
  selectKeyboard,
  selectLanguages,
  selectMetadata,
  selectModules,
  selectNtpServers,
  selectPackages,
  selectPartitions,
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectRegistrationType,
  selectSatelliteCaCertificate,
  selectSatelliteRegistrationCommand,
  selectServerUrl,
  selectServices,
  selectSnapshotDate,
  selectTemplate,
  selectTemplateName,
  selectTimezone,
  selectUseLatest,
  selectUsers,
  wizardState,
} from '../../../store/wizardSlice';
import isRhel from '../../../Utilities/isRhel';
import { FileSystemConfigurationType } from '../steps/FileSystem';
import {
  getConversionFactor,
  Partition,
  Units,
} from '../steps/FileSystem/components/FileSystemTable';
import { PackageRepository } from '../steps/Packages/Packages';
import {
  convertSchemaToIBCustomRepo,
  convertSchemaToIBPayloadRepo,
} from '../steps/Repositories/components/Utilities';
import { AwsShareMethod } from '../steps/TargetEnvironment/Aws';
import { AzureShareMethod } from '../steps/TargetEnvironment/Azure';
import { GcpAccountType, GcpShareMethod } from '../steps/TargetEnvironment/Gcp';

/**
 * This function maps the wizard state to a valid CreateBlueprint request object
 * @param {Store} store redux store
 * @param {string} orgID organization ID
 *
 * @returns {CreateBlueprintRequest} blueprint creation request payload
 */
export const mapRequestFromState = (
  store: Store,
  orgID: string
): CreateBlueprintRequest | CockpitCreateBlueprintRequest => {
  const state = store.getState();
  const imageRequests = getImageRequests(state);
  const customizations = getCustomizations(state, orgID);

  return {
    name: selectBlueprintName(state),
    metadata: selectMetadata(state),
    description: selectBlueprintDescription(state),
    distribution: selectDistribution(state),
    image_requests: imageRequests,
    customizations,
  };
};

const convertFilesystemToPartition = (filesystem: Filesystem): Partition => {
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

/**
 * This function overwrites distribution of the blueprints with the major release
 * and deprecated CentOS 8 with CentOS 9
 * Minor releases were previously used and are still present in older blueprints
 * @param distribution blueprint distribution
 */
const getLatestRelease = (distribution: Distributions) => {
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

function commonRequestToState(
  request: BlueprintResponse | CreateBlueprintRequest
) {
  const gcp = request.image_requests.find(
    (image) => image.image_type === 'gcp'
  );
  const aws = request.image_requests.find(
    (image) => image.image_type === 'aws'
  );

  const azure = request.image_requests.find(
    (image) => image.image_type === 'azure'
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

  const awsUploadOptions = aws?.upload_request
    .options as AwsUploadRequestOptions;
  const gcpUploadOptions = gcp?.upload_request
    .options as GcpUploadRequestOptions;
  const azureUploadOptions = azure?.upload_request
    .options as AzureUploadRequestOptions;

  const arch =
    request.image_requests[0]?.architecture || initialState.architecture;
  if (arch !== 'x86_64' && arch !== 'aarch64') {
    throw new Error(`image type: ${arch} has no implementation yet`);
  }

  let oscapProfile = undefined;
  let compliancePolicyID = undefined;
  if (request.customizations?.openscap) {
    const oscapAsProfile = request.customizations?.openscap as OpenScapProfile;
    if (oscapAsProfile.profile_id !== '') {
      oscapProfile = oscapAsProfile.profile_id as DistributionProfileItem;
    }
    const oscapAsCompliance = request.customizations
      ?.openscap as OpenScapCompliance;
    if (oscapAsCompliance.policy_id !== '') {
      compliancePolicyID = oscapAsCompliance.policy_id;
    }
  }

  return {
    details: {
      blueprintName: request.name || '',
      isCustomName: true,
      blueprintDescription: request.description || '',
    },
    users:
      request.customizations.users?.map((user) => ({
        name: user.name,
        password: '', // The image-builder API does not return the password.
        ssh_key: user.ssh_key || '',
        groups: user.groups || [],
        isAdministrator: user.groups?.includes('wheel') || false,
        hasPassword: user.hasPassword || false,
      })) || [],
    compliance:
      compliancePolicyID !== undefined
        ? {
            complianceType: 'compliance' as ComplianceType,
            policyID: compliancePolicyID,
            profileID: undefined,
            policyTitle: undefined,
          }
        : oscapProfile !== undefined
        ? {
            complianceType: 'openscap' as ComplianceType,
            profileID: oscapProfile,
            policyID: undefined,
            policyTitle: undefined,
          }
        : initialState.compliance,
    firstBoot: request.customizations
      ? {
          script: getFirstBootScript(request.customizations.files),
        }
      : initialState.firstBoot,
    fileSystem: request.customizations?.filesystem
      ? {
          mode: 'manual' as FileSystemConfigurationType,
          partitions: request.customizations?.filesystem.map((fs) =>
            convertFilesystemToPartition(fs)
          ),
        }
      : {
          mode: 'automatic' as FileSystemConfigurationType,
          partitions: [],
        },
    architecture: arch,
    distribution:
      getLatestRelease(request.distribution) || initialState.distribution,
    imageTypes: request.image_requests.map((image) => image.image_type),
    azure: {
      shareMethod: (azureUploadOptions?.source_id
        ? 'sources'
        : 'manual') as AzureShareMethod,
      source: azureUploadOptions?.source_id || '',
      tenantId: azureUploadOptions?.tenant_id || '',
      subscriptionId: azureUploadOptions?.subscription_id || '',
      resourceGroup: azureUploadOptions?.resource_group,
      hyperVGeneration: azureUploadOptions?.hyper_v_generation || 'V1',
    },
    gcp: {
      shareMethod: (gcpUploadOptions?.share_with_accounts
        ? 'withGoogle'
        : 'withInsights') as GcpShareMethod,
      accountType: gcpUploadOptions?.share_with_accounts?.[0].split(
        ':'
      )[0] as GcpAccountType,
      email: gcpUploadOptions?.share_with_accounts?.[0].split(':')[1] || '',
    },
    aws: {
      accountId: awsUploadOptions?.share_with_accounts?.[0] || '',
      shareMethod: (awsUploadOptions?.share_with_sources
        ? 'sources'
        : 'manual') as AwsShareMethod,
      source: { id: awsUploadOptions?.share_with_sources?.[0] },
      sourceId: awsUploadOptions?.share_with_sources?.[0],
    },
    snapshotting: {
      useLatest: !snapshot_date && !request.image_requests[0]?.content_template,
      snapshotDate: snapshot_date,
      template: request.image_requests[0]?.content_template || '',
      templateName: request.image_requests[0]?.content_template_name || '',
    },
    repositories: {
      customRepositories: request.customizations?.custom_repositories || [],
      payloadRepositories: request.customizations?.payload_repositories || [],
      recommendedRepositories: [],
      redHatRepositories: [],
    },
    packages:
      request.customizations?.packages
        ?.filter((pkg) => !pkg.startsWith('@'))
        .map((pkg) => ({
          name: pkg,
          summary: '',
          repository: '' as PackageRepository,
        })) || [],
    groups:
      request.customizations?.packages
        ?.filter((grp) => grp.startsWith('@'))
        .map((grp) => ({
          name: grp.substr(1),
          description: '',
          repository: '' as PackageRepository,
          package_list: [],
        })) || [],
    enabled_modules: request.customizations.enabled_modules || [],
    locale: {
      languages: request.customizations.locale?.languages || [],
      keyboard: request.customizations.locale?.keyboard || '',
    },
    services: {
      enabled: request.customizations?.services?.enabled || [],
      masked: request.customizations?.services?.masked || [],
      disabled: request.customizations?.services?.disabled || [],
    },
    kernel: {
      name: request.customizations.kernel?.name || '',
      append: request.customizations?.kernel?.append?.split(' ') || [],
    },
    timezone: {
      timezone: request.customizations.timezone?.timezone || '',
      ntpservers: request.customizations.timezone?.ntpservers || [],
    },
    hostname: request.customizations.hostname || '',
    firewall: {
      ports: request.customizations.firewall?.ports || [],
      services: {
        enabled: request.customizations.firewall?.services?.enabled || [],
        disabled: request.customizations.firewall?.services?.disabled || [],
      },
    },
  };
}

/**
 * This function maps the blueprint response to the wizard state, used to populate the wizard with the blueprint details
 * @param request BlueprintResponse
 * @param source  V1ListSourceResponseItem
 * @returns wizardState
 */
export const mapRequestToState = (request: BlueprintResponse): wizardState => {
  const wizardMode = 'edit';
  return {
    wizardMode,
    blueprintId: request.id,
    env: {
      serverUrl: request.customizations.subscription?.['server-url'] || '',
      baseUrl: request.customizations.subscription?.['base-url'] || '',
    },
    registration: {
      registrationType:
        request.customizations?.subscription && isRhel(request.distribution)
          ? request.customizations.subscription.rhc
            ? 'register-now-rhc'
            : 'register-now-insights'
          : getSatelliteCommand(request.customizations.files)
          ? 'register-satellite'
          : 'register-later',
      activationKey: isRhel(request.distribution)
        ? request.customizations.subscription?.['activation-key']
        : undefined,
      satelliteRegistration: {
        command: getSatelliteCommand(request.customizations.files),
        caCert: request.customizations.cacerts?.pem_certs[0],
      },
    },
    ...commonRequestToState(request),
  };
};

export function mapToCustomRepositories(
  repo: ApiRepositoryImportResponseRead
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

/**
 * This function maps the blueprint response to the wizard state, used to populate the wizard with the blueprint details
 * @param request BlueprintExportResponse
 * @returns wizardState
 */
export const mapExportRequestToState = (
  request: BlueprintExportResponse,
  image_requests: ImageRequest[]
): wizardState => {
  const wizardMode = 'create';
  const blueprintResponse: CreateBlueprintRequest = {
    name: request.name,
    description: request.description,
    distribution: request.distribution,
    customizations: request.customizations,
    image_requests: image_requests,
  };

  return {
    wizardMode,
    metadata: {
      parent_id: request.metadata?.parent_id || null,
      exported_at: request.metadata?.exported_at || '',
      is_on_prem: request.metadata?.is_on_prem || false,
    },
    env: initialState.env,
    registration: initialState.registration,
    ...commonRequestToState(blueprintResponse),
  };
};

const getFirstBootScript = (files?: File[]): string => {
  const firstBootFile = files?.find((file) => file.path === FIRSTBOOT_PATH);
  return firstBootFile?.data ? atob(firstBootFile.data) : '';
};

const getImageRequests = (
  state: RootState
): ImageRequest[] | CockpitImageRequest[] => {
  const imageTypes = selectImageTypes(state);
  const snapshotDate = selectSnapshotDate(state);
  const useLatest = selectUseLatest(state);
  const template = selectTemplate(state);
  const templateName = selectTemplateName(state);
  return imageTypes.map((type) => ({
    architecture: selectArchitecture(state),
    image_type: type,
    upload_request: {
      type: uploadTypeByTargetEnv(type),
      options: getImageOptions(type, state),
    },
    snapshot_date: !useLatest && !template ? snapshotDate : undefined,
    content_template: template || undefined,
    content_template_name: templateName || undefined,
  }));
};

const getSatelliteCommand = (files?: File[]): string => {
  const satelliteCommandFile = files?.find(
    (file) => file.path === SATELLITE_PATH
  );
  return satelliteCommandFile?.data ? atob(satelliteCommandFile.data) : '';
};

const uploadTypeByTargetEnv = (
  imageType: ImageTypes
): UploadTypes | CockpitUploadTypes => {
  switch (imageType) {
    case 'aws':
      return 'aws';
    case 'gcp':
      return 'gcp';
    case 'azure':
      return 'azure';
    case 'oci':
      return 'oci.objectstorage';
    case 'wsl':
      return 'aws.s3';
    case 'guest-image':
      return 'aws.s3';
    case 'image-installer':
      return 'aws.s3';
    case 'vsphere':
      return 'aws.s3';
    case 'vsphere-ova':
      return 'aws.s3';
    case 'ami':
      return 'aws';
    default: {
      throw new Error(`image type: ${imageType} has no implementation yet`);
    }
  }
};
const getImageOptions = (
  imageType: ImageTypes,
  state: RootState
):
  | AwsUploadRequestOptions
  | AzureUploadRequestOptions
  | GcpUploadRequestOptions
  | CockpitAwsUploadRequestOptions => {
  switch (imageType) {
    case 'aws':
      if (selectAwsShareMethod(state) === 'sources')
        return { share_with_sources: [selectAwsSourceId(state) || ''] };
      if (!process.env.IS_ON_PREMISE)
        return { share_with_accounts: [selectAwsAccountId(state)] };

      // TODO: we might want to update the image-builder-crc api
      // to accept a region instead (with default us-east-1)
      return {
        share_with_accounts: [selectAwsAccountId(state)],
        region: selectAwsRegion(state),
      };
    case 'azure':
      if (selectAzureShareMethod(state) === 'sources')
        return {
          source_id: selectAzureSource(state),
          resource_group: selectAzureResourceGroup(state),
          hyper_v_generation: selectAzureHyperVGeneration(state),
        };
      return {
        tenant_id: selectAzureTenantId(state),
        subscription_id: selectAzureSubscriptionId(state),
        resource_group: selectAzureResourceGroup(state),
        hyper_v_generation: selectAzureHyperVGeneration(state),
      };
    case 'gcp': {
      let googleAccount: string = '';
      if (selectGcpShareMethod(state) === 'withGoogle') {
        const gcpEmail = selectGcpEmail(state);
        switch (selectGcpAccountType(state)) {
          case 'user':
            googleAccount = `user:${gcpEmail}`;
            break;
          case 'serviceAccount':
            googleAccount = `serviceAccount:${gcpEmail}`;
            break;
          case 'group':
            googleAccount = `group:${gcpEmail}`;
            break;
          case 'domain':
            googleAccount = `domain:${gcpEmail}`;
        }
        return { share_with_accounts: [googleAccount] };
      }
      // TODO: GCP withInsights is not implemented yet
      return {};
    }
  }
  return {};
};

const getCustomizations = (state: RootState, orgID: string): Customizations => {
  const satCert = selectSatelliteCaCertificate(state);
  const files: File[] = [];
  if (selectFirstBootScript(state)) {
    files.push({
      path: FIRSTBOOT_SERVICE_PATH,
      data: FIRST_BOOT_SERVICE_DATA,
      data_encoding: 'base64',
      ensure_parents: true,
    });
    files.push({
      path: FIRSTBOOT_PATH,
      data: btoa(selectFirstBootScript(state)),
      data_encoding: 'base64',
      mode: '0774',
      ensure_parents: true,
    });
  }
  const satCmd = selectSatelliteRegistrationCommand(state);
  if (satCmd && selectRegistrationType(state) === 'register-satellite') {
    files.push({
      path: SATELLITE_SERVICE_PATH,
      data: SATELLITE_SERVICE_DATA,
      data_encoding: 'base64',
      ensure_parents: true,
    });
    files.push({
      path: SATELLITE_PATH,
      data: btoa(satCmd),
      mode: '0774',
      data_encoding: 'base64',
      ensure_parents: true,
    });
  }
  return {
    containers: undefined,
    directories: undefined,
    files: files.length > 0 ? files : undefined,
    subscription: getSubscription(state, orgID),
    packages: getPackages(state),
    enabled_modules: getModules(state),
    payload_repositories: getPayloadRepositories(state),
    custom_repositories: getCustomRepositories(state),
    openscap: getOpenscap(state),
    filesystem: getFileSystem(state),
    users: getUsers(state),
    services: getServices(state),
    hostname: selectHostname(state) || undefined,
    kernel: getKernel(state),
    groups: undefined,
    timezone: getTimezone(state),
    locale: getLocale(state),
    firewall: getFirewall(state),
    installation_device: undefined,
    fdo: undefined,
    ignition: undefined,
    partitioning_mode: undefined,
    fips: undefined,
    cacerts:
      satCert && selectRegistrationType(state) === 'register-satellite'
        ? {
            pem_certs: [satCert],
          }
        : undefined,
  };
};

const getServices = (state: RootState): Services | undefined => {
  const services = selectServices(state);
  const enabledSvcs = services.enabled || [];
  if (
    enabledSvcs.length === 0 &&
    services.masked.length === 0 &&
    services.disabled.length === 0
  ) {
    return undefined;
  }

  return {
    enabled: enabledSvcs.length ? enabledSvcs : undefined,
    masked: services.masked.length ? services.masked : undefined,
    disabled: services.disabled.length ? services.disabled : undefined,
  };
};

const getOpenscap = (state: RootState): OpenScap | undefined => {
  const complianceType = selectComplianceType(state);
  const profile = selectComplianceProfileID(state);
  const policy = selectCompliancePolicyID(state);

  if (complianceType === 'openscap' && profile) {
    return { profile_id: profile };
  }
  if (complianceType === 'compliance' && policy) {
    return { policy_id: policy };
  }
  return undefined;
};

const getUsers = (state: RootState): User[] | undefined => {
  const users = selectUsers(state);

  if (users.length === 0) {
    return undefined;
  }

  return users.map((user) => {
    const result: User = {
      name: user.name,
    };
    if (user.password !== '') {
      result.password = user.password;
    }
    if (user.ssh_key !== '') {
      result.ssh_key = user.ssh_key;
    }
    if (user.groups.length > 0) {
      result.groups = user.groups;
    }
    result.hasPassword = user.hasPassword || user.password !== '';
    return result as User;
  });
};

const getFileSystem = (state: RootState): Filesystem[] | undefined => {
  const mode = selectFileSystemConfigurationType(state);

  const convertToBytes = (minSize: string, conversionFactor: number) => {
    return minSize.length > 0 ? parseInt(minSize) * conversionFactor : 0;
  };

  if (mode === 'manual') {
    const partitions = selectPartitions(state);
    const fileSystem = partitions.map((partition) => {
      return {
        min_size: convertToBytes(
          partition.min_size,
          getConversionFactor(partition.unit)
        ),
        mountpoint: partition.mountpoint,
      };
    });
    return fileSystem;
  }
  return undefined;
};

const getPackages = (state: RootState) => {
  const packages = selectPackages(state);
  const groups = selectGroups(state);

  if (packages.length > 0 || groups.length > 0) {
    return packages
      .map((pkg) => pkg.name)
      .concat(groups.map((grp) => '@' + grp.name));
  }
  return undefined;
};

const getModules = (state: RootState) => {
  const modules = selectModules(state);

  if (modules.length > 0) {
    return modules;
  }
  return undefined;
};

const getTimezone = (state: RootState) => {
  const timezone = selectTimezone(state);
  const ntpservers = selectNtpServers(state);

  if (!timezone && ntpservers?.length === 0) {
    return undefined;
  }
  return {
    timezone: timezone ? timezone : undefined,
    ntpservers: ntpservers && ntpservers.length > 0 ? ntpservers : undefined,
  };
};

const getSubscription = (
  state: RootState,
  orgID: string
): Subscription | undefined => {
  const registrationType = selectRegistrationType(state);
  const activationKey = selectActivationKey(state);

  if (
    registrationType === 'register-later' ||
    registrationType === 'register-satellite'
  ) {
    return undefined;
  }

  if (activationKey === undefined) {
    throw new Error(
      'Activation key unexpectedly undefined while generating subscription customization'
    );
  }

  const initialSubscription = {
    'activation-key': activationKey,
    organization: Number(orgID),
    'server-url': selectServerUrl(state),
    'base-url': selectBaseUrl(state),
  };

  switch (registrationType) {
    case 'register-now-rhc':
      return { ...initialSubscription, insights: true, rhc: true };
    case 'register-now-insights':
      return { ...initialSubscription, insights: true, rhc: false };
    case 'register-now':
      return { ...initialSubscription, insights: false, rhc: false };
  }
};

const getLocale = (state: RootState) => {
  const languages = selectLanguages(state);
  const keyboard = selectKeyboard(state);

  if (languages?.length === 0 && !keyboard) {
    return undefined;
  }
  return {
    languages: languages && languages.length > 0 ? languages : undefined,
    keyboard: keyboard ? keyboard : undefined,
  };
};

const getFirewall = (state: RootState) => {
  const ports = selectFirewall(state).ports;
  const services = selectFirewall(state).services;

  const firewall = {};

  if (ports.length > 0) {
    Object.assign(firewall, { ports: ports });
  }

  if (services.enabled.length > 0 || services.disabled.length > 0) {
    Object.assign(firewall, {
      services: {
        enabled: services.enabled.length > 0 ? services.enabled : undefined,
        disabled: services.disabled.length > 0 ? services.disabled : undefined,
      },
    });
  }

  return Object.keys(firewall).length > 0 ? firewall : undefined;
};

const getCustomRepositories = (state: RootState) => {
  const customRepositories = selectCustomRepositories(state).map((cr) => {
    return {
      ...cr,
      baseurl: cr.baseurl && cr.baseurl.length !== 0 ? cr.baseurl : undefined,
    } as CustomRepository;
  });

  const recommendedRepositories = selectRecommendedRepositories(state);

  const customAndRecommendedRepositories = [...customRepositories];

  for (const repo in recommendedRepositories) {
    customAndRecommendedRepositories.push(
      convertSchemaToIBCustomRepo(recommendedRepositories[repo])
    );
  }

  if (customAndRecommendedRepositories.length === 0) {
    return undefined;
  }
  return customAndRecommendedRepositories;
};

const getPayloadRepositories = (state: RootState) => {
  const payloadRepositories = selectPayloadRepositories(state);
  const recommendedRepositories = selectRecommendedRepositories(state);

  const payloadAndRecommendedRepositories = [...payloadRepositories];

  for (const repo in recommendedRepositories) {
    payloadAndRecommendedRepositories.push(
      convertSchemaToIBPayloadRepo(recommendedRepositories[repo])
    );
  }

  if (payloadAndRecommendedRepositories.length === 0) {
    return undefined;
  }
  return payloadAndRecommendedRepositories;
};

const getKernel = (state: RootState) => {
  const kernel = selectKernel(state);
  const kernelAppendString = selectKernel(state).append.join(' ');

  const kernelRequest = {};

  if (!kernel.name && kernel.append.length === 0) {
    return undefined;
  }

  if (kernel.name) {
    Object.assign(kernelRequest, {
      name: kernel.name,
    });
  }

  if (kernelAppendString !== '') {
    Object.assign(kernelRequest, {
      append: kernelAppendString,
    });
  }

  return Object.keys(kernelRequest).length > 0 ? kernelRequest : undefined;
};
