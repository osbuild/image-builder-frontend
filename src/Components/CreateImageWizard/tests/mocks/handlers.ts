import { GetBlueprintApiResponse } from '@/store/api/backend';
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

export type BlueprintHandlerOptions = {
  blueprint: GetBlueprintApiResponse;
};

export const createBlueprintHandler = (
  options: BlueprintHandlerOptions,
): FetchHandler => {
  const { blueprint } = options;

  return ({ url, method }) => {
    const blueprintMatch = url.match(/\/blueprints\/([^/?]+)/);
    if (!blueprintMatch || method !== 'GET') {
      return null;
    }

    const requestedId = blueprintMatch[1];
    return requestedId === blueprint.id ? JSON.stringify(blueprint) : null;
  };
};

export const createDefaultFetchHandler = (): FetchHandler => {
  return composeHandlers(
    createArchitecturesHandler({ architectures: mockArchitectures }),
    createActivationKeysHandler(),
    createSourcesHandler(),
  );
};
