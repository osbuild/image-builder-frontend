import { screen, waitFor, within } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  typeWithWait,
} from '@/test/testUtils';

import {
  clearSearchInput,
  clickOnSearchBox,
  openPackageDetails,
  renderPackagesStep,
  selectPkgOption,
  switchToPackageGroups,
  typeIntoSearchBox,
} from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  fetchMock,
  mockEpelSearch,
  mockGroupSearchResults,
  mockModuleSearchResults,
  mockSearchResults,
} from './mocks';

fetchMock.enableMocks();

vi.mock('@/Utilities/useDebounce', () => ({
  default: <T,>(value: T): T => value,
}));

// Disable global MSW server for this file - we use fetch mocks instead
beforeAll(() => {
  server.close();
});

// Restore global MSW server so other tests don't break
afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Packages Component', () => {
  describe('Loading State', () => {
    test('shows loading spinner while searching for packages', async () => {
      // Create a promise that won't resolve immediately to keep loading state
      let resolveSearch!: (value: string) => void;
      const searchPromise = new Promise<string>((resolve) => {
        resolveSearch = resolve;
      });

      // Override the default handler to return a pending promise for RPM searches
      fetchMock.mockResponse((req) => {
        if (req.url.endsWith('/rpms/names') && req.method === 'POST') {
          return searchPromise;
        }
        return createDefaultFetchHandler({ url: req.url, method: req.method });
      });

      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      // The loading spinner should be visible while waiting
      expect(await screen.findByText(/searching/i)).toBeInTheDocument();

      // Resolve the promise to complete the test
      resolveSearch(JSON.stringify(mockSearchResults));

      // Loading should disappear and results should appear
      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
      });
      await screen.findByRole('option', { name: /test-lib/ });
    });

    test('shows loading spinner while searching for groups', async () => {
      let resolveSearch!: (value: string) => void;
      const searchPromise = new Promise<string>((resolve) => {
        resolveSearch = resolve;
      });

      // Override the default handler to return a pending promise for group searches
      fetchMock.mockResponse((req) => {
        if (
          req.url.endsWith('/package_groups/names') &&
          req.method === 'POST'
        ) {
          return searchPromise;
        }

        return createDefaultFetchHandler({ url: req.url, method: req.method });
      });

      renderPackagesStep();
      const user = createUser();

      await switchToPackageGroups(user);

      await typeIntoSearchBox(user, 'grouper');

      expect(await screen.findByText(/searching/i)).toBeInTheDocument();

      resolveSearch(JSON.stringify(mockGroupSearchResults));

      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
      });
      await screen.findByRole('option', { name: /grouper/i });
    });
  });

  describe('Search Functionality', () => {
    test('displays package type dropdown and search bar', async () => {
      renderPackagesStep();
      expect(
        await screen.findByRole('button', { name: /individual packages/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('textbox', { name: /search packages/i }),
      ).toBeInTheDocument();
    });

    test('shows default empty state', async () => {
      renderPackagesStep();
      expect(
        await screen.findByRole('heading', {
          name: /there are no selected packages/i,
        }),
      ).toBeInTheDocument();
    });

    test('shows "too short" message for single character search', async () => {
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 't');

      expect(
        await screen.findByText(
          'The search value must be greater than 1 character',
        ),
      ).toBeInTheDocument();
    });

    test('shows "no results" for failed search', async () => {
      // Default handler returns empty arrays, so no override needed
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'asdf');

      expect(
        screen.getByText(/No results for "asdf" in selected repositories/),
      ).toBeInTheDocument();
    });

    test('displays search results sorted by relevance', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      // Wait for results to appear
      await screen.findByRole('option', { name: /test-lib/ });

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent(/test/);
      expect(options[1]).toHaveTextContent(/test-lib/);
      expect(options[2]).toHaveTextContent(/testPkg/);
    });

    test('searches other repositories when no results', async () => {
      renderPackagesStep();
      const user = createUser();

      const searchInput = await screen.findByRole('textbox', {
        name: /search packages/i,
      });

      await clearWithWait(user, searchInput);
      await typeWithWait(user, searchInput, 'asdf');

      expect(
        await screen.findByText(
          /no results for "asdf" in selected repositories/i,
        ),
      ).toBeInTheDocument();

      const searchOutsideButton = await screen.findByRole('button', {
        name: /search repositories outside of this image/i,
      });

      // Mock EPEL results for the next search after clicking the button
      fetchMock.mockResponse(
        createFetchHandler({
          rpms: mockEpelSearch,
        }),
      );

      await clickWithWait(user, searchOutsideButton);

      expect(
        await screen.findByRole('option', { name: /asdf/ }),
      ).toBeInTheDocument();
      expect(
        await screen.findByText(
          /showing results from other repositories \(epel\)/i,
        ),
      ).toBeInTheDocument();
    });

    test('shows final state with no results in other repositories', async () => {
      renderPackagesStep();
      const user = createUser();

      const searchInput = await screen.findByRole('textbox', {
        name: /search packages/i,
      });

      await clearWithWait(user, searchInput);
      await typeWithWait(user, searchInput, 'asdf');

      expect(
        await screen.findByText(
          /no results for "asdf" in selected repositories/i,
        ),
      ).toBeInTheDocument();

      const searchOutsideButton = await screen.findByRole('button', {
        name: /search repositories outside of this image/i,
      });
      await clickWithWait(user, searchOutsideButton);

      expect(
        await screen.findByText(/no packages found for "asdf"/i),
      ).toBeInTheDocument();
    });
  });

  describe('Package Selection', () => {
    test('selecting a package adds it to the table', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      const option = await screen.findByRole('option', { name: /test-lib/ });

      await clickWithWait(user, option);
      expect(
        await screen.findByRole('cell', { name: /test-lib/ }),
      ).toBeVisible();
    });

    test('deselecting a package removes it from the table', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      const option = await screen.findByRole('option', { name: /test-lib/ });

      await clickWithWait(user, option);
      expect(
        await screen.findByRole('cell', { name: /test-lib/ }),
      ).toBeVisible();

      await clearSearchInput(user);
      await typeIntoSearchBox(user, 'test');

      const optionAgain = await screen.findByRole('option', {
        name: /test-lib/,
      });
      await clickWithWait(user, optionAgain);
      await waitFor(() =>
        expect(
          screen.queryByRole('cell', { name: /test-lib/ }),
        ).not.toBeInTheDocument(),
      );
    });
  });

  describe('Modules', () => {
    test('modules render with streams on separate lines', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'testModule');

      // Wait for module streams to appear
      await screen.findByText(/1\.22/);
      await screen.findByText(/1\.24/);

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent(/1\.24/);
      expect(options[1]).toHaveTextContent(/1\.22/);
    });

    test('displays retirement dates for module streams', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'testModule');

      // Wait for module streams to appear
      await screen.findByText(/1\.22/);
      await screen.findByText(/1\.24/);

      const options = await screen.findAllByRole('option');

      // Stream 1.24 has end_date: '2027-05-01'
      expect(options[0]).toHaveTextContent(/May 2027/);
      // Stream 1.22 has end_date: '2025-05-01'
      expect(options[1]).toHaveTextContent(/May 2025/);
    });

    test('selecting a module stream disables other streams', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'testModule');

      // Wait for module streams to appear
      await screen.findByText(/1\.22/);
      await screen.findByText(/1\.24/);

      // Select the first module stream (1.24)
      const options = await screen.findAllByRole('option');
      await clickWithWait(user, options[0]);

      // The other stream (1.22) should be disabled
      await clickOnSearchBox(user);
      expect(options[1]).toBeDisabled();
    });
  });

  describe('Package Groups', () => {
    test('searches for groups with "Package groups" option', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await switchToPackageGroups(user);
      await typeIntoSearchBox(user, 'grouper');

      expect(
        screen.getByRole('option', { name: /grouper/i }),
      ).toBeInTheDocument();
    });

    test('selecting a group checks the checkbox', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await switchToPackageGroups(user);
      await typeIntoSearchBox(user, 'grouper');

      expect(screen.getByText(/grouper/i)).toBeInTheDocument();

      // Select the group
      await selectPkgOption(user, 'grouper');
      expect(
        await screen.findByRole('cell', { name: /grouper/i }),
      ).toBeInTheDocument();
    });

    test('shows included packages in expanded row', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await switchToPackageGroups(user);
      await typeIntoSearchBox(user, 'grouper');

      expect(screen.getByText(/grouper/i)).toBeInTheDocument();
      await selectPkgOption(user, 'grouper');

      // Click the expandable button to open group details
      await openPackageDetails(user);

      // Verify the included packages table appears
      const table = await screen.findByTestId('group-included-packages-table');
      const rows = await within(table).findAllByRole('row');
      expect(rows).toHaveLength(2);

      // Check that the packages are listed
      expect(rows[0]).toHaveTextContent('fish1');
      expect(rows[1]).toHaveTextContent('fish2');
    });
  });

  describe('Redux State Integration', () => {
    test('selecting a package updates Redux state with package data', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      const { store } = renderPackagesStep();
      const user = createUser();

      // Initial state should have no packages
      expect(store.getState().wizard.packages).toHaveLength(0);

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('option', { name: /test-lib/ });

      // Select the first package (sorted by relevance: 'test')
      await selectPkgOption(user, 'test');

      // Verify Redux state was updated
      const packages = store.getState().wizard.packages;
      expect(packages).toHaveLength(1);
      expect(packages[0].name).toBe('test');
    });

    test('deselecting a package removes it from Redux state', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      const { store } = renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('option', { name: /test-lib/ });

      // Select then deselect
      await selectPkgOption(user, 'test');
      expect(store.getState().wizard.packages).toHaveLength(1);

      await clickOnSearchBox(user);
      await selectPkgOption(user, 'test');
      expect(store.getState().wizard.packages).toHaveLength(0);
    });

    test('selecting multiple packages updates Redux state correctly', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      const { store } = renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('option', { name: /test-lib/ });

      // Select all three packages
      await selectPkgOption(user, 'test');
      await clickOnSearchBox(user);
      await selectPkgOption(user, 'test-lib');
      await clickOnSearchBox(user);
      await selectPkgOption(user, 'testPkg');

      await waitFor(() => {
        const packages = store.getState().wizard.packages;
        expect(packages).toHaveLength(3);
        expect(packages.map((p) => p.name).sort()).toEqual([
          'test',
          'test-lib',
          'testPkg',
        ]);
      });
    });

    test('selecting a group updates Redux groups state', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      const { store } = renderPackagesStep();
      const user = createUser();

      // Initial state should have no groups
      expect(store.getState().wizard.groups).toHaveLength(0);

      await switchToPackageGroups(user);
      await typeIntoSearchBox(user, 'grouper');
      expect(screen.getByText(/grouper/i)).toBeInTheDocument();

      await selectPkgOption(user, 'grouper');

      const groups = store.getState().wizard.groups;
      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('grouper');
    });

    test('selecting a module stream updates Redux modules state', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      const { store } = renderPackagesStep();
      const user = createUser();

      // Initial state should have no modules
      expect(store.getState().wizard.enabled_modules).toHaveLength(0);

      await typeIntoSearchBox(user, 'testModule');
      await screen.findByText(/1\.24/);

      // Select the first stream (1.24)
      const options = await screen.findAllByRole('option');
      await clickWithWait(user, options[0]);

      const modules = store.getState().wizard.enabled_modules;
      expect(modules).toHaveLength(1);
      expect(modules[0].name).toBe('testModule');
      expect(modules[0].stream).toBe('1.24');
    });

    test('preloaded packages state persists in Selected view', async () => {
      const { store } = renderPackagesStep({
        packages: [
          {
            name: 'preloaded-pkg',
            summary: 'A preloaded package',
            repository: 'distro',
          },
          {
            name: 'another-pkg',
            summary: 'Another package',
            repository: 'distro',
          },
        ],
      });

      // Verify initial Redux state has preloaded packages
      expect(store.getState().wizard.packages).toHaveLength(2);

      // Verify packages appear in UI
      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent('another-pkg');
      expect(rows[1]).toHaveTextContent('preloaded-pkg');
    });
  });

  describe('Selected Packages View', () => {
    test('selected packages are sorted alphabetically', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      // Search and select all packages (in reverse order to verify sorting)
      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('option', { name: /test-lib/ });

      // Select packages in reverse alphabetical order
      await selectPkgOption(user, 'testPkg');
      await clickOnSearchBox(user);
      await selectPkgOption(user, 'test-lib');
      await clickOnSearchBox(user);
      await selectPkgOption(user, 'test');

      // Verify all packages are shown and sorted
      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveTextContent('test');
      expect(rows[1]).toHaveTextContent('test-lib');
      expect(rows[2]).toHaveTextContent('testPkg');
    });

    test('shows empty state when no packages selected', async () => {
      renderPackagesStep();

      await screen.findByText(/there are no selected packages/i);
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in search input does not trigger page reload', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      const searchInput = await screen.findByRole('textbox', {
        name: /search packages/i,
      });
      await typeWithWait(user, searchInput, 'test-pkg{Enter}');

      expect(
        screen.getByRole('button', { name: /individual packages/i }),
      ).toBeInTheDocument();
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('test-pkg');
    });
  });
});
