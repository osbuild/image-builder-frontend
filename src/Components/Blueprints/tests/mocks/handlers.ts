import type { GetBlueprintsApiResponse } from '@/store/api/backend';
import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import {
  composeHandlers,
  CONTENT_SOURCES_URL,
  createBlueprintsHandler,
  createRepositoriesHandler,
  type FetchHandler,
  fetchMock,
  type FetchRequest,
  IMAGE_BUILDER_URL,
} from '@/test/testUtils';

import {
  blueprintsEndpoint,
  getBlueprintComposesResponse,
  getBlueprintResponse,
} from './fixtures';

export { fetchMock };

type BulkImportOverrides = {
  response?: object[];
  shouldFail?: boolean;
};

type ListOverrides = {
  repositories?: ApiRepositoryResponseRead[];
  shouldFail?: boolean;
};

type FetchHandlerOverrides = {
  bulkImport?: BulkImportOverrides;
  list?: ListOverrides;
};

const createBulkImportHandler = (
  overrides: BulkImportOverrides = {},
): FetchHandler => {
  const { response = [], shouldFail = false } = overrides;

  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(CONTENT_SOURCES_URL + '/repositories/bulk_import') &&
      method === 'POST'
    ) {
      if (shouldFail) {
        throw new Error('Bulk import failed');
      }
      return JSON.stringify(response);
    }
    return null;
  };
};

const createListRepositoriesHandler = (
  overrides: ListOverrides = {},
): FetchHandler => {
  if (overrides.shouldFail) {
    return ({ url, method }: FetchRequest) => {
      if (
        url.startsWith(CONTENT_SOURCES_URL + '/repositories') &&
        !url.includes('bulk_import') &&
        method === 'GET'
      ) {
        throw new Error('List repositories failed');
      }
      return null;
    };
  }

  return createRepositoriesHandler({
    repositories: overrides.repositories,
  });
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  return composeHandlers(
    createBulkImportHandler(overrides.bulkImport),
    createListRepositoriesHandler(overrides.list),
    createBlueprintsHandler(),
  );
};

export const createDefaultFetchHandler = createFetchHandler();

type BlueprintsListOverrides = {
  blueprintsResponse?: GetBlueprintsApiResponse;
  shouldFail?: boolean;
};

const createBlueprintsListHandler = (
  overrides: BlueprintsListOverrides = {},
): FetchHandler => {
  const { blueprintsResponse, shouldFail = false } = overrides;

  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(IMAGE_BUILDER_URL + '/blueprints') &&
      !url.includes('/blueprints/') &&
      method === 'GET'
    ) {
      if (shouldFail) {
        throw new Error('Blueprints request failed');
      }
      if (blueprintsResponse) {
        return JSON.stringify(blueprintsResponse);
      }
      return JSON.stringify(blueprintsEndpoint(new URL(url)));
    }
    return null;
  };
};

const createBlueprintDetailsHandler = (
  fixedBlueprintIds: Set<string>,
): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprints/') &&
      !url.includes('/composes') &&
      !url.includes('/fixup') &&
      method === 'GET'
    ) {
      const id = url.split('/blueprints/')[1].split('?')[0];
      const resp = getBlueprintResponse(id, fixedBlueprintIds);
      return JSON.stringify(resp);
    }
    return null;
  };
};

const createBlueprintComposesHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprints/') &&
      url.includes('/composes') &&
      method === 'GET'
    ) {
      const id = url.split('/blueprints/')[1].split('/composes')[0];
      return JSON.stringify(getBlueprintComposesResponse(id));
    }
    return null;
  };
};

const createBlueprintFixupHandler = (
  fixedBlueprintIds: Set<string>,
): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprints/') &&
      url.includes('/fixup') &&
      method === 'POST'
    ) {
      const id = url.split('/blueprints/')[1].split('/fixup')[0];
      fixedBlueprintIds.add(id);
      return JSON.stringify({});
    }
    return null;
  };
};

const createBlueprintComposeHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.includes('/blueprint/') &&
      url.includes('/compose') &&
      method === 'POST'
    ) {
      return JSON.stringify({});
    }
    return null;
  };
};

const createBlueprintUpdateHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (url.includes('/blueprints/') && method === 'PUT') {
      const id = url.split('/blueprints/')[1].split('?')[0];
      return JSON.stringify({ id });
    }
    return null;
  };
};

const createComposesHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(IMAGE_BUILDER_URL + '/composes') &&
      !url.includes('/composes/') &&
      method === 'GET'
    ) {
      return JSON.stringify({
        meta: { count: 0 },
        links: { first: 'first', last: 'last' },
        data: [],
      });
    }
    return null;
  };
};

const createComposeStatusHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (url.includes('/composes/') && method === 'GET') {
      return JSON.stringify({
        image_status: { status: 'success' },
      });
    }
    return null;
  };
};

type LandingPageHandlerOverrides = {
  blueprints?: BlueprintsListOverrides;
};

export const createLandingPageHandler = (
  overrides: LandingPageHandlerOverrides = {},
): FetchHandler => {
  const fixedBlueprintIds = new Set<string>();

  return composeHandlers(
    createBlueprintFixupHandler(fixedBlueprintIds),
    createBlueprintComposeHandler(),
    createBlueprintUpdateHandler(),
    createBlueprintComposesHandler(),
    createBlueprintDetailsHandler(fixedBlueprintIds),
    createBlueprintsListHandler(overrides.blueprints),
    createComposesHandler(),
    createComposeStatusHandler(),
  );
};

export const createDefaultLandingPageHandler = createLandingPageHandler();
