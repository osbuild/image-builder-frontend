import {
  BlueprintExportResponse,
  BlueprintMetadata,
  BlueprintResponse,
  ComposerCreateBlueprintRequest,
  CreateBlueprintRequest,
  CustomRepository,
  File,
  ImageRequest,
} from '@/store/api/backend';
import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';
import {
  initialState,
  isRhel,
  parseCloudProvidersFromRequest,
  parseComplianceFromRequest,
  parseContentFromRequest,
  parseFilesystemFromRequest,
  parseOutputFromRequest,
  parseSystemFromRequest,
  RegistrationType,
  WizardState,
} from '@/store/slices/wizard';

import { SATELLITE_PATH } from '../../../constants';

function commonRequestToState(
  request:
    | BlueprintResponse
    | CreateBlueprintRequest
    | ComposerCreateBlueprintRequest,
) {
  // we need to check for the region for on-prem

  const arch =
    request.image_requests[0]?.architecture ?? initialState.output.architecture;
  if (!['x86_64', 'aarch64'].includes(arch)) {
    throw new Error(`image type: ${arch} has no implementation yet`);
  }

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
    filesystem: parseFilesystemFromRequest(request),
    compliance: parseComplianceFromRequest(request),
    content: parseContentFromRequest(request),
    output: parseOutputFromRequest(request),
    cloudProviders: parseCloudProvidersFromRequest(request),
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
    filesystem: parseFilesystemFromRequest(blueprint),
    compliance: parseComplianceFromRequest(blueprint),
    content: parseContentFromRequest(blueprint),
    output: parseOutputFromRequest(blueprint),
    cloudProviders: parseCloudProvidersFromRequest(blueprint),
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
