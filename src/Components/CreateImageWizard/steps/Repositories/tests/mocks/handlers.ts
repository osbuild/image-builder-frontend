import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import {
  composeHandlers,
  createRecommendationsHandler,
  createRepositoriesHandler,
  createTemplatesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

export { fetchMock };

type FetchHandlerOverrides = {
  repositories?: ApiRepositoryResponseRead[];
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  return composeHandlers(
    createRepositoriesHandler({ repositories: overrides.repositories }),
    createTemplatesHandler(),
    createRecommendationsHandler(),
  );
};

export const createDefaultFetchHandler = createFetchHandler();
