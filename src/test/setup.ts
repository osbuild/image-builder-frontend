import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

import { server } from './mocks/server';
import 'vitest-canvas-mock';

// scrollTo is not defined in jsdom - needed for the navigation to the wizard
window.HTMLElement.prototype.scrollTo = function () {};

// provide a fallback *only* when window.getComputedStyle is missing
window.getComputedStyle =
  // eslint-disable-next-line disable-autofix/@typescript-eslint/no-unnecessary-condition
  window.getComputedStyle ||
  (() => ({
    getPropertyValue: () => '',
  }));

// ResizeObserver is not defined and needs to be mocked and stubbed
const MockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', MockResizeObserver);

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  default: () => ({
    auth: {
      getUser: async () => ({
        identity: {
          internal: {
            org_id: 5,
          },
        },
      }),
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
    analytics: {
      track: () => 'test',
      group: () => 'test',
      screen: () => 'test',
    },
  }),
}));

vi.mock(import('../../src/constants'), async (importOriginal) => {
  const mod = await importOriginal(); // type is inferred
  return {
    ...mod,
    // replace some exports
    UNIQUE_VALIDATION_DELAY: 0,
  };
});

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.import.enabled':
        return true;
      case 'image-builder.satellite.enabled':
        return true;
      case 'image-builder.templates.enabled':
        return true;
      case 'image-builder.aap.enabled':
        return true;
      case 'image-builder.advanced-partitioning.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

// remove DOM dump from the testing-library output
configure({
  getElementError: (message: string | null, _container: Element) => {
    const error = new Error(message ?? '');
    error.name = 'TestingLibraryElementError';
    error.stack = '';
    return error;
  },
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
