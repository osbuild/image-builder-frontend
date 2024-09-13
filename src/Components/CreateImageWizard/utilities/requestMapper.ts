import { Store } from 'redux';
import { v4 as uuidv4 } from 'uuid';

import { parseSizeUnit } from './parseSizeUnit';

import {
  CENTOS_9,
  FIRST_BOOT_SERVICE,
  FIRST_BOOT_SERVICE_DATA,
  RHEL_8,
  RHEL_9,
} from '../../../constants';
import { RootState } from '../../../store';
import {
  AwsUploadRequestOptions,
  AzureUploadRequestOptions,
  BlueprintExportResponse,
  BlueprintResponse,
  CreateBlueprintRequest,
  Customizations,
  DistributionProfileItem,
  Distributions,
  File,
  Filesystem,
  GcpUploadRequestOptions,
  ImageRequest,
  ImageTypes,
  OpenScap,
  Services,
  Subscription,
  UploadTypes,
} from '../../../store/imageBuilderApi';
import {
  selectActivationKey,
  selectArchitecture,
  selectAwsAccountId,
  selectAwsShareMethod,
  selectAwsSourceId,
  selectAzureResourceGroup,
  selectAzureShareMethod,
  selectAzureSource,
  selectAzureSubscriptionId,
  selectAzureTenantId,
  selectBaseUrl,
  selectBlueprintDescription,
  selectBlueprintName,
  selectCustomRepositories,
  selectDistribution,
  selectGcpAccountType,
  selectGcpEmail,
  selectGcpShareMethod,
  selectGroups,
  selectImageTypes,
  selectPackages,
  selectPayloadRepositories,
  selectRecommendedRepositories,
  selectProfile,
  selectRegistrationType,
  selectServerUrl,
  wizardState,
  selectFileSystemConfigurationType,
  selectPartitions,
  selectSnapshotDate,
  selectUseLatest,
  selectFirstBootScript,
  selectMetadata,
  initialState,
} from '../../../store/wizardSlice';
import {
  convertMMDDYYYYToYYYYMMDD,
  convertYYYYMMDDTOMMDDYYYY,
} from '../../../Utilities/time';
import { FileSystemConfigurationType } from '../steps/FileSystem';
import {
  getConversionFactor,
  Partition,
  Units,
} from '../steps/FileSystem/FileSystemConfiguration';
import { PackageRepository } from '../steps/Packages/Packages';
import {
  convertSchemaToIBCustomRepo,
  convertSchemaToIBPayloadRepo,
} from '../steps/Repositories/components/Utilities';
import { AwsShareMethod } from '../steps/TargetEnvironment/Aws';
import { AzureShareMethod } from '../steps/TargetEnvironment/Azure';
import { GcpAccountType, GcpShareMethod } from '../steps/TargetEnvironment/Gcp';

type ServerStore = {
  kernel?: { append?: string }; // TODO use API types
  services?: { enabled?: string[]; disabled?: string[]; masked?: string[] }; // TODO use API types
};

/**
 * This function maps the wizard state to a valid CreateBlueprint request object
 * @param {Store} store redux store
 * @param {string} orgID organization ID
 *
 * @returns {CreateBlueprintRequest} blueprint creation request payload
 */
export const mapRequestFromState = (
  store: Store,
  orgID: string,
  serverStore: ServerStore
): CreateBlueprintRequest => {
  const state = store.getState();
  const imageRequests = getImageRequests(state);
  const customizations = getCustomizations(state, orgID, serverStore);

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
  return distribution.startsWith('rhel-9')
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

  const snapshot_date = convertYYYYMMDDTOMMDDYYYY(
    request.image_requests.find((image) => !!image.snapshot_date)
      ?.snapshot_date || ''
  );

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
  return {
    details: {
      blueprintName: request.name || '',
      blueprintDescription: request.description || '',
    },
    openScap: request.customizations
      ? {
          profile: request.customizations.openscap
            ?.profile_id as DistributionProfileItem,
        }
      : initialState.openScap,
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
    azure: azureUploadOptions
      ? {
          shareMethod: (azureUploadOptions?.source_id
            ? 'sources'
            : 'manual') as AzureShareMethod,
          source: azureUploadOptions?.source_id || '',
          tenantId: azureUploadOptions?.tenant_id || '',
          subscriptionId: azureUploadOptions?.subscription_id || '',
          resourceGroup: azureUploadOptions?.resource_group,
        }
      : initialState.azure,
    gcp: gcpUploadOptions
      ? {
          shareMethod: (gcpUploadOptions?.share_with_accounts
            ? 'withGoogle'
            : 'withInsights') as GcpShareMethod,
          accountType: gcpUploadOptions?.share_with_accounts?.[0].split(
            ':'
          )[0] as GcpAccountType,
          email: gcpUploadOptions?.share_with_accounts?.[0].split(':')[1] || '',
        }
      : initialState.gcp,
    aws: awsUploadOptions
      ? {
          accountId: awsUploadOptions?.share_with_accounts?.[0] || '',
          shareMethod: (awsUploadOptions?.share_with_sources
            ? 'sources'
            : 'manual') as AwsShareMethod,
          source: { id: awsUploadOptions?.share_with_sources?.[0] },
          sourceId: awsUploadOptions?.share_with_sources?.[0],
        }
      : initialState.aws,
    snapshotting: {
      useLatest: !snapshot_date,
      snapshotDate: snapshot_date,
    },
    repositories: {
      customRepositories: request.customizations?.custom_repositories || [],
      payloadRepositories: request.customizations?.payload_repositories || [],
      recommendedRepositories: [],
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
      registrationType: request.customizations?.subscription
        ? request.customizations.subscription.rhc
          ? 'register-now-rhc'
          : 'register-now-insights'
        : 'register-later',
      activationKey: request.customizations.subscription?.['activation-key'],
    },
    ...commonRequestToState(request),
  };
};

/**
 * This function maps the blueprint response to the wizard state, used to populate the wizard with the blueprint details
 * @param request BlueprintExportResponse
 * @returns wizardState
 */
export const mapExportRequestToState = (
  request: BlueprintExportResponse,
  image_requests: ImageRequest[],
  subscribed: boolean
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
    },
    env: subscribed
      ? {
          serverUrl:
            request.customizations.subscription?.['server-url'] ||
            initialState.env.serverUrl,
          baseUrl:
            request.customizations.subscription?.['base-url'] ||
            initialState.env.baseUrl,
        }
      : {
          serverUrl: '',
          baseUrl: '',
        },
    registration: subscribed
      ? {
          registrationType: request.customizations?.subscription
            ? request.customizations.subscription.rhc
              ? 'register-now-rhc'
              : 'register-now-insights'
            : initialState.registration.registrationType,
          activationKey:
            request.customizations.subscription?.['activation-key'] ||
            initialState.registration.activationKey,
        }
      : {
          registrationType: 'register-later',
          activationKey: '',
        },
    ...commonRequestToState(blueprintResponse),
  };
};

const getFirstBootScript = (files?: File[]): string => {
  const firstBootFile = files?.find(
    (file) => file.path === '/usr/local/sbin/custom-first-boot'
  );
  return firstBootFile?.data ? atob(firstBootFile.data) : '';
};

const getImageRequests = (state: RootState): ImageRequest[] => {
  const imageTypes = selectImageTypes(state);
  const snapshotDate = convertMMDDYYYYToYYYYMMDD(selectSnapshotDate(state));
  const useLatest = selectUseLatest(state);
  return imageTypes.map((type) => ({
    architecture: selectArchitecture(state),
    image_type: type,
    upload_request: {
      type: uploadTypeByTargetEnv(type),
      options: getImageOptions(type, state),
    },
    snapshot_date: useLatest ? undefined : snapshotDate,
  }));
};

const uploadTypeByTargetEnv = (imageType: ImageTypes): UploadTypes => {
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
      // TODO: add edge type
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
  | GcpUploadRequestOptions => {
  switch (imageType) {
    case 'aws':
      if (selectAwsShareMethod(state) === 'sources')
        return { share_with_sources: [selectAwsSourceId(state) || ''] };
      else return { share_with_accounts: [selectAwsAccountId(state)] };
    case 'azure':
      if (selectAzureShareMethod(state) === 'sources')
        return {
          source_id: selectAzureSource(state),
          resource_group: selectAzureResourceGroup(state),
        };
      else
        return {
          tenant_id: selectAzureTenantId(state),
          subscription_id: selectAzureSubscriptionId(state),
          resource_group: selectAzureResourceGroup(state),
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
      } else {
        // TODO: GCP withInsights is not implemented yet
        return {};
      }
    }
  }
  return {};
};

const getCustomizations = (
  state: RootState,
  orgID: string,
  serverStore: ServerStore
): Customizations => {
  return {
    containers: undefined,
    directories: undefined,
    files: selectFirstBootScript(state)
      ? [
          {
            path: '/etc/systemd/system/custom-first-boot.service',
            data: FIRST_BOOT_SERVICE_DATA,
            data_encoding: 'base64',
            ensure_parents: true,
          },
          {
            path: '/usr/local/sbin/custom-first-boot',
            data: btoa(selectFirstBootScript(state)),
            data_encoding: 'base64',
            mode: '0774',
            ensure_parents: true,
          },
        ]
      : undefined,
    subscription: getSubscription(state, orgID),
    packages: getPackages(state),
    payload_repositories: getPayloadRepositories(state),
    custom_repositories: getCustomRepositories(state),
    openscap: getOpenscapProfile(state),
    filesystem: getFileSystem(state),
    users: undefined,
    services: getServices(serverStore, state),
    hostname: undefined,
    kernel: serverStore.kernel?.append
      ? { append: serverStore.kernel?.append }
      : undefined,
    groups: undefined,
    timezone: undefined,
    locale: undefined,
    firewall: undefined,
    installation_device: undefined,
    fdo: undefined,
    ignition: undefined,
    partitioning_mode: undefined,
    fips: undefined,
  };
};

const getServices = (
  serverStore: ServerStore,
  state: RootState
): Services | undefined => {
  const serverEnabledServices: string[] | undefined =
    serverStore.services?.enabled;
  const serverDisabledServicesFromServer: string[] | undefined =
    serverStore.services?.disabled;
  const serverMaskedServices = serverStore.services?.masked;
  const firstbootFlag: boolean =
    !!selectFirstBootScript(state) &&
    !serverEnabledServices?.includes(FIRST_BOOT_SERVICE);

  const enabledServices = [
    ...(serverEnabledServices ? serverEnabledServices : []),
    ...(firstbootFlag ? [FIRST_BOOT_SERVICE] : []),
  ];

  if (
    enabledServices.length ||
    serverDisabledServicesFromServer ||
    serverMaskedServices
  ) {
    return {
      enabled: enabledServices,
      disabled: serverDisabledServicesFromServer,
      masked: serverMaskedServices,
    };
  }
  return undefined;
};

const getOpenscapProfile = (state: RootState): OpenScap | undefined => {
  const profile = selectProfile(state);
  if (profile) {
    return { profile_id: profile };
  }
  return undefined;
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
  } else {
    return undefined;
  }
};

const getSubscription = (
  state: RootState,
  orgID: string
): Subscription | undefined => {
  const registrationType = selectRegistrationType(state);
  const activationKey = selectActivationKey(state);

  if (registrationType === 'register-later') {
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

const getCustomRepositories = (state: RootState) => {
  const customRepositories = selectCustomRepositories(state);
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
