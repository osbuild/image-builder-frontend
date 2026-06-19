import type { ApiRepositoryResponseRead } from '@/store/api/contentSources';
import {
  composeHandlers,
  CONTENT_SOURCES_URL,
  createBlueprintsHandler,
  createRepositoriesHandler,
  type FetchHandler,
  fetchMock,
  type FetchRequest,
} from '@/test/testUtils';

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
