import type { GetOscapCustomizationsApiResponse } from '@/store/api/backend';
import {
  composeHandlers,
  createOscapHandler,
  createOscapProfilesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockOscapCustomizations, mockOscapProfiles } from './fixtures';

export { fetchMock };

type FetchHandlerOverrides = {
  profiles?: string[];
  customizations?: GetOscapCustomizationsApiResponse;
};

export const createFetchHandler = (
  overrides: FetchHandlerOverrides = {},
): FetchHandler => {
  const handlers = [
    createOscapProfilesHandler({
      profiles: overrides.profiles ?? mockOscapProfiles,
    }),
    createOscapHandler({
      customizations: overrides.customizations ?? mockOscapCustomizations,
    }),
  ];

  return composeHandlers(...handlers);
};

export const createDefaultFetchHandler = createFetchHandler();
