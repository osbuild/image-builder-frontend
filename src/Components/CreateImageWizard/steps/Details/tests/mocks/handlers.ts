import type { BlueprintsResponse } from '@/store/api/backend';
import {
  composeHandlers,
  createBlueprintsHandler,
  emptyBlueprintsResponse,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

export { fetchMock };

export { emptyBlueprintsResponse, IMAGE_BUILDER_URL } from '@/test/testUtils';

export { duplicateBlueprintsResponse } from './fixtures';

type FetchHandlerOptions = {
  blueprintsResponse?: BlueprintsResponse;
};

export const createFetchHandler = (
  options: FetchHandlerOptions = {},
): FetchHandler => {
  const { blueprintsResponse = emptyBlueprintsResponse } = options;

  return composeHandlers(createBlueprintsHandler({ blueprintsResponse }));
};

export const createDefaultFetchHandler = createFetchHandler();
