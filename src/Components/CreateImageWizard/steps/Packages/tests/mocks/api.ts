import createFetchMock from 'vitest-fetch-mock';

import { mockArchitectures } from './data';

export const fetchMock = createFetchMock(vi);

export const CONTENT_SOURCES_URL =
  'http://localhost:3000/api/content-sources/v1';

export const createDefaultFetchHandler = ({
  url,
  method,
}: {
  url: string;
  method: string;
}) => {
  if (url.endsWith('/rpms/names') && method === 'POST') {
    return JSON.stringify([]);
  }

  if (url.endsWith('/package_groups/names') && method === 'POST') {
    return JSON.stringify([]);
  }

  const archMatch = url.match(/\/architectures\/(rhel-\d+)$/);
  if (archMatch && method === 'GET') {
    const distro = archMatch[1];
    if (distro in mockArchitectures) {
      return JSON.stringify(mockArchitectures[distro]);
    }
  }

  if (
    url.startsWith(CONTENT_SOURCES_URL + '/repositories') &&
    method === 'GET'
  ) {
    return JSON.stringify({
      data: [],
      meta: { count: 0, limit: 100, offset: 0 },
    });
  }

  if (url.startsWith(CONTENT_SOURCES_URL + '/templates') && method === 'GET') {
    return JSON.stringify({
      data: [],
      meta: { count: 0, limit: 100, offset: 0 },
    });
  }

  if (url.endsWith('/experimental/recommendations') && method === 'POST') {
    return JSON.stringify({ body: { packages: [] } });
  }

  throw new Error(`Unhandled fetch: ${method} ${url}`);
};
