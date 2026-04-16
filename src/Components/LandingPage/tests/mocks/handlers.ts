import {
  composeHandlers,
  createBlueprintsHandler,
  emptyBlueprintsResponse,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

export { fetchMock };

const emptyComposesResponse = {
  data: [],
  links: { first: '', last: '' },
  meta: { count: 0 },
};

const createComposesHandler = (): FetchHandler => {
  return ({ url, method }) => {
    if (url.includes('/composes') && method === 'GET') {
      return JSON.stringify(emptyComposesResponse);
    }
    return null;
  };
};

export const createDefaultFetchHandler = composeHandlers(
  createBlueprintsHandler({ blueprintsResponse: emptyBlueprintsResponse }),
  createComposesHandler(),
);
