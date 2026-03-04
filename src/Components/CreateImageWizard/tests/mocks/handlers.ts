import {
  composeHandlers,
  createArchitecturesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockArchitectures } from './fixtures';

export { fetchMock };

export const createActivationKeysHandler = (): FetchHandler => {
  return ({ url, method }) => {
    if (url.includes('/activation_keys') && method === 'GET') {
      return JSON.stringify({ body: [] });
    }
    return null;
  };
};

export const createSourcesHandler = (): FetchHandler => {
  return ({ url, method }) => {
    if (url.includes('/sources') && method === 'GET') {
      return JSON.stringify({ data: [] });
    }
    return null;
  };
};

export const createDefaultFetchHandler = (): FetchHandler => {
  return composeHandlers(
    createArchitecturesHandler({ architectures: mockArchitectures }),
    createActivationKeysHandler(),
    createSourcesHandler(),
  );
};
