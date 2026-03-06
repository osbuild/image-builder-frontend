import {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
} from '@/store/api/contentSources';
import {
  composeHandlers,
  createArchitecturesHandler,
  createGroupsHandler,
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
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  return composeHandlers(
    createRpmHandler({ rpms: overrides.rpms }),
    createGroupsHandler({ groups: overrides.groups }),
    createArchitecturesHandler({ architectures: mockArchitectures }),
    createRepositoriesHandler(),
    createTemplatesHandler(),
    createRecommendationsHandler(),
  );
};

export const createDefaultFetchHandler = createFetchHandler();
