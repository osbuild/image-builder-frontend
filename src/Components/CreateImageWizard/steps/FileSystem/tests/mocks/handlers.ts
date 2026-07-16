import type { GetOscapCustomizationsApiResponse } from '@/store/api/backend';
import {
  composeHandlers,
  createOscapHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockOscapCustomizations } from './fixtures';

export { fetchMock };

type FetchHandlerOverrides = {
  customizations?: GetOscapCustomizationsApiResponse;
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  const handlers = [
    createOscapHandler({
      customizations: overrides.customizations ?? mockOscapCustomizations,
    }),
  ];

  return composeHandlers(...handlers);
};

export const createDefaultFetchHandler = createFetchHandler();
