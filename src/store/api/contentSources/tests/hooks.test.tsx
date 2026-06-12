import React from 'react';

import { waitFor } from '@testing-library/react';
import cockpit from 'cockpit';

import { server } from '@/test/mocks/server';
import {
  fetchMock,
  renderWithRedux,
  type RenderWithReduxOptions,
} from '@/test/testUtils';

import { useSearchLanguagePacks } from '../hooks';

fetchMock.enableMocks();

// Test component that exposes hook state
const TestComponent = ({ distroUrls }: { distroUrls: string[] }) => {
  const { isLoading } = useSearchLanguagePacks(distroUrls);
  return <span data-testid='loading'>{isLoading ? 'true' : 'false'}</span>;
};

// Wizard state with candidate langpacks (requires a non-C locale)
const withLangpacks = {
  locale: {
    keyboard: 'us',
    languages: ['en_US.UTF-8'],
  },
};

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('useSearchLanguagePacks', () => {
  describe('hosted path', () => {
    test('skips search when distroUrls is empty', async () => {
      fetchMock.mockResponse(() => {
        throw new Error('should not be called');
      });

      renderWithRedux(<TestComponent distroUrls={[]} />, withLangpacks);

      // Give the effect a tick to run (it shouldn't)
      await new Promise((r) => setTimeout(r, 50));

      // No fetch should have been made
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test('sends hosted request shape with exact_names and urls', async () => {
      let capturedBody: Record<string, unknown> | undefined;
      fetchMock.mockResponse((req) => {
        return req.text().then((text) => {
          capturedBody = JSON.parse(text);
          return JSON.stringify([{ package_name: 'langpacks-en' }]);
        });
      });

      renderWithRedux(<TestComponent distroUrls={['http://repo.example']} />, {
        ...withLangpacks,
      });

      await waitFor(() => {
        expect(capturedBody).toBeDefined();
      });

      expect(capturedBody).toEqual(
        expect.objectContaining({
          exact_names: expect.any(Array),
          urls: ['http://repo.example'],
          limit: 500,
        }),
      );
      // Should NOT have on-prem fields
      expect(capturedBody).not.toHaveProperty('packages');
      expect(capturedBody).not.toHaveProperty('architecture');
    });
  });

  describe('on-prem path', () => {
    const onPremOptions: RenderWithReduxOptions = {
      preloadedState: { env: { isOnPremise: true } },
    };

    test('does NOT skip search when distroUrls is empty', async () => {
      // On-prem doesn't use distroUrls, so empty distroUrls should
      // not prevent the search from running. Before the fix,
      // process.env.IS_ON_PREMISE was used (always falsy in tests)
      // which incorrectly caused an early return.
      let capturedBody: Record<string, unknown> | undefined;
      const httpSpy = vi.spyOn(cockpit, 'http').mockReturnValue({
        request: (opts: { body?: string }) => {
          capturedBody = JSON.parse(opts.body ?? '{}');
          return Promise.resolve(JSON.stringify({ packages: [] }));
        },
      } as ReturnType<typeof cockpit.http>);

      renderWithRedux(
        <TestComponent distroUrls={[]} />,
        withLangpacks,
        onPremOptions,
      );

      await waitFor(() => {
        expect(capturedBody).toBeDefined();
      });

      httpSpy.mockRestore();
    });

    test('sends on-prem request shape with packages, architecture, distribution', async () => {
      let capturedBody: Record<string, unknown> | undefined;
      const httpSpy = vi.spyOn(cockpit, 'http').mockReturnValue({
        request: (opts: { body?: string }) => {
          capturedBody = JSON.parse(opts.body ?? '{}');
          return Promise.resolve(JSON.stringify({ packages: [] }));
        },
      } as ReturnType<typeof cockpit.http>);

      renderWithRedux(
        <TestComponent distroUrls={[]} />,
        {
          ...withLangpacks,
          distribution: 'centos-10',
          architecture: 'x86_64',
        },
        onPremOptions,
      );

      await waitFor(() => {
        expect(capturedBody).toBeDefined();
      });

      expect(capturedBody).toEqual(
        expect.objectContaining({
          packages: expect.any(Array),
          architecture: 'x86_64',
          distribution: 'centos-10',
        }),
      );
      // Should NOT have hosted fields
      expect(capturedBody).not.toHaveProperty('exact_names');
      expect(capturedBody).not.toHaveProperty('urls');
      expect(capturedBody).not.toHaveProperty('limit');

      httpSpy.mockRestore();
    });
  });

  describe('no candidates', () => {
    test('skips search when there are no candidate langpacks', async () => {
      fetchMock.mockResponse(() => {
        throw new Error('should not be called');
      });

      // Default locale 'C.UTF-8' produces no langpack candidates
      renderWithRedux(<TestComponent distroUrls={['http://repo.example']} />);

      await new Promise((r) => setTimeout(r, 50));

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
