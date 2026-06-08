import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

import { server } from './mocks/server';
import 'vitest-canvas-mock';

// scrollTo and scrollIntoView are not defined in jsdom
window.HTMLElement.prototype.scrollTo = function () {};
window.HTMLElement.prototype.scrollIntoView = function () {};

// provide a fallback *only* when window.getComputedStyle is missing
window.getComputedStyle =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  window.getComputedStyle ||
  (() => ({
    getPropertyValue: () => '',
  }));

// ResizeObserver is not defined and needs to be mocked and stubbed
const MockResizeObserver = vi.fn(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

vi.stubGlobal('ResizeObserver', MockResizeObserver);

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  default: () => ({
    auth: {
      getUser: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              identity: {
                internal: {
                  org_id: 5,
                },
              },
            });
          }, 0);
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
      // case <flag>:
      //   return true;
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

// Fail tests on console warnings and errors
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  vi.spyOn(console, 'error').mockImplementation((...args) => {
    const message = args.join(' ');
    if (message.includes('Maximum update depth exceeded')) {
      return;
    }
    throw new Error(`Console error:\n${message}`);
  });

  vi.spyOn(console, 'warn').mockImplementation((...args) => {
    const message = args.join(' ');
    if (message.includes('Maximum update depth exceeded')) {
      return;
    }
    throw new Error(`Console warning:\n${message}`);
  });
});

afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

afterEach(() => server.resetHandlers());
