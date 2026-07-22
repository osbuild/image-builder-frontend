import {
  composeHandlers,
  createBlueprintsHandler,
  type FetchHandler,
  fetchMock,
  type FetchRequest,
  IMAGE_BUILDER_URL,
} from '@/test/testUtils';

import {
  composesEndpoint,
  DARK_CHOCOLATE_BLUEPRINT_ID,
  mockBlueprintComposes,
  mockStatus,
} from './fixtures';

export { fetchMock };

type ComposesHandlerOptions = {
  composesEndpointFn?: (url: URL) => unknown;
  shouldFail?: boolean;
};

const createComposesHandler = (
  options: ComposesHandlerOptions = {},
): FetchHandler => {
  const { composesEndpointFn = composesEndpoint, shouldFail = false } = options;

  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(IMAGE_BUILDER_URL + '/composes') &&
      !url.includes('/composes/') &&
      method === 'GET'
    ) {
      if (shouldFail) {
        throw new Error('Composes request failed');
      }
      return JSON.stringify(composesEndpointFn(new URL(url)));
    }
    return null;
  };
};

const createComposeStatusHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (url.includes('/composes/') && method === 'GET') {
      const composeId = url.split('/composes/')[1].split('?')[0];
      return JSON.stringify(
        mockStatus(composeId) ?? { status_code: 404, title: 'Not found' },
      );
    }
    return null;
  };
};

type BlueprintComposesHandlerOptions = {
  blueprintComposes?: unknown;
};

const createBlueprintComposesHandler = (
  options: BlueprintComposesHandlerOptions = {},
): FetchHandler => {
  const { blueprintComposes = mockBlueprintComposes } = options;

  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprints/') &&
      url.includes('/composes') &&
      method === 'GET'
    ) {
      return JSON.stringify(blueprintComposes);
    }
    return null;
  };
};

const createBlueprintDetailsHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprints/') &&
      !url.includes('/composes') &&
      method === 'GET'
    ) {
      return JSON.stringify({
        id: DARK_CHOCOLATE_BLUEPRINT_ID,
        name: 'Dark Chocolate',
        version: 1,
        description: 'A test blueprint',
        distribution: 'rhel-9',
        image_requests: [
          {
            architecture: 'x86_64',
            image_type: 'aws',
            upload_request: {
              type: 'aws',
              options: { share_with_accounts: ['123123123123'] },
            },
          },
        ],
        customizations: {},
        lint: { errors: [], warnings: [] },
      });
    }
    return null;
  };
};

type FetchHandlerOverrides = {
  blueprints?: Parameters<typeof createBlueprintsHandler>[0];
  composes?: ComposesHandlerOptions;
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  return composeHandlers(
    createComposesHandler(overrides.composes),
    createComposeStatusHandler(),
    createBlueprintComposesHandler(),
    createBlueprintDetailsHandler(),
    createBlueprintsHandler(overrides.blueprints),
  );
};

export const createDefaultFetchHandler = createFetchHandler();
