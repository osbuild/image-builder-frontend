import {
  BlueprintExportResponse as Blueprint,
  BlueprintResponse as Request,
} from '@/store/api/backend';

import { parseCloudProvidersFromRequest } from './cloud';
import { parseComplianceFromRequest } from './compliance';
import { parseContentFromRequest } from './content';
import { parseDetailsFromRequest } from './details';
import { parseFilesystemFromRequest } from './filesystem';
import { parseOutputFromRequest } from './output';
import { parseRegistrationFromRequest } from './registration';
import type { WizardState } from './slice';
import { parseSystemFromRequest } from './system';

export const parseStateFromRequest = (
  request: Request | Blueprint,
): WizardState => ({
  details: parseDetailsFromRequest(request),
  system: parseSystemFromRequest(request),
  filesystem: parseFilesystemFromRequest(request),
  compliance: parseComplianceFromRequest(request),
  content: parseContentFromRequest(request),
  output: parseOutputFromRequest(request),
  cloudProviders: parseCloudProvidersFromRequest(request),
  registration: parseRegistrationFromRequest(request),
});
