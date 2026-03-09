import { Architectures } from '@/store/api/backend';
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

export const createCustomArchitecturesHandler = (
  architectures: Record<string, Architectures>,
): FetchHandler => {
  return composeHandlers(createArchitecturesHandler({ architectures }));
};

export const setupErrorHandler = (
  message: string = 'Internal Server Error',
): void => {
  fetchMock.resetMocks();
  fetchMock.enableMocks();
  fetchMock.mockReject(new Error(message));
};
