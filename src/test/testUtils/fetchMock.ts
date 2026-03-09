import createFetchMock from 'vitest-fetch-mock';

import { Architectures, BlueprintsResponse } from '@/store/api/backend';
import {
  ApiSearchPackageGroupResponse,
  ApiSearchRpmResponse,
  ApiTemplateResponseRead,
} from '@/store/api/contentSources';

// Shared fetch mock instance
export const fetchMock = createFetchMock(vi);

// Common types
export type FetchRequest = {
  url: string;
  method: string;
};

export type FetchHandler = (req: FetchRequest) => string | null;

// API base URLs
export const IMAGE_BUILDER_URL = 'http://localhost:3000/api/image-builder/v1';
export const CONTENT_SOURCES_URL =
  'http://localhost:3000/api/content-sources/v1';

// Common response types
export const emptyBlueprintsResponse: BlueprintsResponse = {
  data: [],
  links: {
    first: '',
    last: '',
  },
  meta: {
    count: 0,
  },
};

export const emptyListResponse = {
  data: [],
  meta: { count: 0, limit: 100, offset: 0 },
};

// Compose multiple handlers into a single handler
export const composeHandlers = (
  ...handlers: FetchHandler[]
): ((req: FetchRequest) => string) => {
  return (req: FetchRequest) => {
    for (const handler of handlers) {
      const result = handler(req);
      if (result !== null) {
        return result;
      }
    }
    throw new Error(`Unhandled fetch: ${req.method} ${req.url}`);
  };
};

// Blueprints handler
export type BlueprintsHandlerOptions = {
  blueprintsResponse?: BlueprintsResponse;
};

export const createBlueprintsHandler = (
  options: BlueprintsHandlerOptions = {},
): FetchHandler => {
  const { blueprintsResponse = emptyBlueprintsResponse } = options;

  return ({ url, method }: FetchRequest) => {
    if (url.includes('/blueprints') && method === 'GET') {
      return JSON.stringify(blueprintsResponse);
    }
    return null;
  };
};

// Content sources repositories handler
export const createRepositoriesHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(CONTENT_SOURCES_URL + '/repositories') &&
      method === 'GET'
    ) {
      return JSON.stringify(emptyListResponse);
    }
    return null;
  };
};

// Content sources templates handler
export type TemplatesHandlerOptions = {
  templates?: ApiTemplateResponseRead[] | undefined;
};

export const createTemplatesHandler = (
  options: TemplatesHandlerOptions = {},
): FetchHandler => {
  const { templates = [] } = options;

  return ({ url, method }: FetchRequest) => {
    if (
      url.startsWith(CONTENT_SOURCES_URL + '/templates') &&
      method === 'GET'
    ) {
      return JSON.stringify({
        data: templates,
        meta: { count: templates.length, limit: 100, offset: 0 },
      });
    }
    return null;
  };
};

// Recommendations handler
export const createRecommendationsHandler = (): FetchHandler => {
  return ({ url, method }: FetchRequest) => {
    if (url.endsWith('/experimental/recommendations') && method === 'POST') {
      return JSON.stringify({ body: { packages: [] } });
    }
    return null;
  };
};

// RPM search handler
export type RpmHandlerOptions = {
  rpms?: ApiSearchRpmResponse[] | undefined;
};

export const createRpmHandler = (
  options: RpmHandlerOptions = {},
): FetchHandler => {
  const { rpms = [] } = options;

  return ({ url, method }: FetchRequest) => {
    if (url.endsWith('/rpms/names') && method === 'POST') {
      return JSON.stringify(rpms);
    }
    return null;
  };
};

// Package groups handler
export type GroupsHandlerOptions = {
  groups?: ApiSearchPackageGroupResponse[] | undefined;
};

export const createGroupsHandler = (
  options: GroupsHandlerOptions = {},
): FetchHandler => {
  const { groups = [] } = options;

  return ({ url, method }: FetchRequest) => {
    if (url.endsWith('/package_groups/names') && method === 'POST') {
      return JSON.stringify(groups);
    }
    return null;
  };
};

// Architectures handler
export type ArchitecturesHandlerOptions = {
  architectures?: Record<string, Architectures>;
};

export const createArchitecturesHandler = (
  options: ArchitecturesHandlerOptions = {},
): FetchHandler => {
  const { architectures = {} } = options;

  return ({ url, method }: FetchRequest) => {
    const archMatch = url.match(/\/architectures\/(rhel-\d+)$/);
    if (archMatch && method === 'GET') {
      const distro = archMatch[1];
      if (distro in architectures) {
        return JSON.stringify(architectures[distro]);
      }
    }
    return null;
  };
};
