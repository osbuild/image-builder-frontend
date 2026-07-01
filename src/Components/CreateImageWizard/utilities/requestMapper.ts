import {
  BlueprintExportResponse,
  BlueprintResponse,
  CustomRepository,
  ImageRequest,
} from '@/store/api/backend';
import {
  ApiRepositoryImportResponseRead,
  ApiRepositoryResponseRead,
} from '@/store/api/contentSources';
import {
  parseCloudProvidersFromRequest,
  parseComplianceFromRequest,
  parseContentFromRequest,
  parseDetailsFromRequest,
  parseFilesystemFromRequest,
  parseOutputFromRequest,
  parseRegistrationFromRequest,
  parseSystemFromRequest,
  WizardState,
} from '@/store/slices/wizard';

/**
 * This function maps the blueprint response to the wizard state, used to populate the wizard with the blueprint details
 * @param request BlueprintResponse
 * @param source  V1ListSourceResponseItem
 * @returns WizardState
 */
export const mapRequestToState = (request: BlueprintResponse): WizardState => {
  return {
    details: parseDetailsFromRequest(request),
    system: parseSystemFromRequest(request),
    filesystem: parseFilesystemFromRequest(request),
    compliance: parseComplianceFromRequest(request),
    content: parseContentFromRequest(request),
    output: parseOutputFromRequest(request),
    cloudProviders: parseCloudProvidersFromRequest(request),
    registration: parseRegistrationFromRequest(request),
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

/**
 * Maps a BlueprintExportResponse to the wizard state, used to populate the wizard when importing a blueprint.
 */
export const mapBlueprintExportToState = (
  blueprint: BlueprintExportResponse,
  _: ImageRequest[],
): WizardState => {
  return {
    details: parseDetailsFromRequest(blueprint),
    system: parseSystemFromRequest(blueprint),
    filesystem: parseFilesystemFromRequest(blueprint),
    compliance: parseComplianceFromRequest(blueprint),
    content: parseContentFromRequest(blueprint),
    output: parseOutputFromRequest(blueprint),
    cloudProviders: parseCloudProvidersFromRequest(blueprint),
    registration: parseRegistrationFromRequest(blueprint),
  };
};
