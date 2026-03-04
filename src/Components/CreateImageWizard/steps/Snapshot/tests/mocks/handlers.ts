import {
  composeHandlers,
  createTemplatesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockTemplates } from './fixtures';

export { fetchMock };

export const createFetchHandler = (): FetchHandler => {
  return composeHandlers(createTemplatesHandler({ templates: mockTemplates }));
};

export const createDefaultFetchHandler = createFetchHandler();
