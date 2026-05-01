import type { GetOscapCustomizationsApiResponse } from '@/store/api/backend';
import {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '@/store/api/contentSources';
import {
  composeHandlers,
  createArchitecturesHandler,
  createGroupsHandler,
  createOscapHandler,
  createRecommendationsHandler,
  createRepositoriesHandler,
  createRpmHandler,
  createTemplatesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockArchitectures } from './fixtures';

export { fetchMock };

type FetchHandlerOverrides = {
  rpms?: ApiSearchRpmResponse[];
  groups?: ApiSearchPackageGroupResponse[];
  oscap?: GetOscapCustomizationsApiResponse;
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  const handlers = [
    createRpmHandler({ rpms: overrides.rpms }),
    createGroupsHandler({ groups: overrides.groups }),
    createArchitecturesHandler({ architectures: mockArchitectures }),
    createRepositoriesHandler(),
    createTemplatesHandler(),
    createRecommendationsHandler(),
    createOscapHandler(
      overrides.oscap ? { customizations: overrides.oscap } : {},
    ),
  ];

  return composeHandlers(...handlers);
};

export const createDefaultFetchHandler = createFetchHandler();
