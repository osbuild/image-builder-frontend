import type { ListActivationKeysApiResponse } from '@/store/api/rhsm';
import {
  composeHandlers,
  type FetchHandler,
  fetchMock,
  type FetchRequest,
} from '@/test/testUtils';

import { mockActivationKeys } from './fixtures';

export { fetchMock };

type RhsmHandlerOptions = {
  activationKeys?: ListActivationKeysApiResponse;
};

export const createRhsmHandler = (
  options: RhsmHandlerOptions = {},
): FetchHandler => {
  const { activationKeys = mockActivationKeys } = options;

  return ({ url, method }: FetchRequest) => {
    if (url.includes('/activation_keys') && method === 'GET') {
      return JSON.stringify(activationKeys);
    }
    return null;
  };
};

export const createFetchHandler = (
  options: RhsmHandlerOptions = {},
): FetchHandler => {
  return composeHandlers(createRhsmHandler(options));
};

export const createDefaultFetchHandler = createFetchHandler();
