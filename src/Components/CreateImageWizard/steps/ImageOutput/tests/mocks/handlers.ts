import {
  composeHandlers,
  createArchitecturesHandler,
  type FetchHandler,
  fetchMock,
} from '@/test/testUtils';

import { mockArchitecturesBoth } from './fixtures';

export { fetchMock };

export const createDefaultFetchHandler = (): FetchHandler => {
  return composeHandlers(
    createArchitecturesHandler({
      architectures: {
        'rhel-10': mockArchitecturesBoth,
        'rhel-9': mockArchitecturesBoth,
        'rhel-8': mockArchitecturesBoth,
      },
    }),
  );
};
