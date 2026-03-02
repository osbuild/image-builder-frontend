import { screen, waitFor, within } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { createUser } from '@/test/testUtils';

import {
  clearSearchInput,
  clickPackageCheckbox,
  renderPackagesStep,
  toggleSelectedPackages,
  typeIntoSearchBox,
} from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  fetchMock,
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
      await screen.findByRole('cell', { name: /test-lib/ });
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

      // Use @ prefix to search for groups
      await typeIntoSearchBox(user, '@group');

      expect(await screen.findByText(/searching/i)).toBeInTheDocument();

      resolveSearch(JSON.stringify(mockGroupSearchResults));

      await waitFor(() => {
        expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
      });
      await screen.findByText(/@grouper/i);
    });
  });

  describe('Search Functionality', () => {
    test('displays search bar and toggle buttons', async () => {
      renderPackagesStep();
      expect(
        await screen.findByRole('textbox', { name: /search packages/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /available/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /selected/i }),
      ).toBeInTheDocument();
    });

    test('shows default empty state', async () => {
      renderPackagesStep();
      expect(
        await screen.findByText(/search for additional packages/i),
      ).toBeInTheDocument();
    });

    test('shows "too short" message for single character search', async () => {
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 't');

      expect(
        await screen.findByText('The search value is too short'),
      ).toBeInTheDocument();
    });

    test('shows "no results" for failed search', async () => {
      // Default handler returns empty arrays, so no override needed
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'asdf');

      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    test('displays search results sorted by relevance', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      // Wait for results to appear
      await screen.findByRole('cell', { name: /test-lib/ });

      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveTextContent('test');
      expect(rows[1]).toHaveTextContent('test-lib');
      expect(rows[2]).toHaveTextContent('testPkg');
    });
  });

  describe('Package Selection', () => {
    test('selecting a package checks the checkbox', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('cell', { name: /test-lib/ });

      const checkbox = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
      expect(checkbox).not.toBeChecked();

      await waitFor(() => user.click(checkbox));

      await waitFor(() => expect(checkbox).toBeChecked());
    });

    test('selected packages appear in Selected view', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      // Search and select a package
      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('cell', { name: /test-lib/ });
      await clickPackageCheckbox(user, 0);

      // Toggle to Selected view
      await toggleSelectedPackages(user);

      // Verify the selected package is shown
      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveTextContent('test');
    });

    test('deselecting a package unchecks the checkbox', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('cell', { name: /test-lib/ });

      const checkbox = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });

      // Select then deselect
      await waitFor(() => user.click(checkbox));
      await waitFor(() => expect(checkbox).toBeChecked());

      await waitFor(() => user.click(checkbox));
      await waitFor(() => expect(checkbox).not.toBeChecked());
    });
  });

  describe('Pagination', () => {
    test('shows correct item count after search', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('cell', { name: /test-lib/ });

      const topPagination = await screen.findByTestId(
        'packages-pagination-top',
      );
      expect(topPagination).toHaveTextContent('of 3');

      const bottomPagination = await screen.findByTestId(
        'packages-pagination-bottom',
      );
      expect(bottomPagination).toHaveTextContent('of 3');
    });

    test('shows correct item count after toggling to selected', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('cell', { name: /test-lib/ });
      await clickPackageCheckbox(user, 0);

      await toggleSelectedPackages(user);

      const topPagination = await screen.findByTestId(
        'packages-pagination-top',
      );
      expect(topPagination).toHaveTextContent('of 1');

      const bottomPagination = await screen.findByTestId(
        'packages-pagination-bottom',
      );
      expect(bottomPagination).toHaveTextContent('of 1');
    });

    test('shows zero item count after clearing search input', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');

      await screen.findByRole('cell', { name: /test-lib/ });
      await clickPackageCheckbox(user, 0);

      await clearSearchInput(user);

      // Wait for the empty state to appear
      await waitFor(() => {
        expect(
          screen.getByText(/search for additional packages/i),
        ).toBeInTheDocument();
      });

      const topPagination = await screen.findByTestId(
        'packages-pagination-top',
      );
      expect(topPagination).toHaveTextContent('of 0');
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
      await screen.findByText('1.22');
      await screen.findByText('1.24');

      const rows = await screen.findAllByRole('row');
      // Remove header row
      const dataRows = rows.slice(1);
      expect(dataRows).toHaveLength(2);
      expect(dataRows[0]).toHaveTextContent('1.24');
      expect(dataRows[1]).toHaveTextContent('1.22');
    });

    test('displays retirement dates for module streams', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'testModule');

      // Wait for module streams to appear
      await screen.findByText('1.22');
      await screen.findByText('1.24');

      const rows = await screen.findAllByRole('row');
      const dataRows = rows.slice(1);

      // Stream 1.24 has end_date: '2027-05-01'
      expect(dataRows[0]).toHaveTextContent('May 2027');
      // Stream 1.22 has end_date: '2025-05-01'
      expect(dataRows[1]).toHaveTextContent('May 2025');
    });

    test('selecting a module stream disables other streams', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ rpms: mockModuleSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'testModule');

      // Wait for module streams to appear
      await screen.findByText('1.22');
      await screen.findByText('1.24');

      // Select the first module stream (1.24)
      const checkbox = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
      await waitFor(() => user.click(checkbox));
      await waitFor(() => expect(checkbox).toBeChecked());

      // The other stream (1.22) should be disabled
      const otherCheckbox = await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
      expect(otherCheckbox).toBeDisabled();
    });
  });

  describe('Package Groups', () => {
    test('searches for groups with @ prefix', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, '@grouper');

      // Wait for group to appear (groups show with @ prefix in the table)
      await waitFor(() => {
        expect(screen.getByText(/@grouper/i)).toBeInTheDocument();
      });
    });

    test('selecting a group checks the checkbox', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, '@grouper');

      // Wait for group to appear
      await waitFor(() => {
        expect(screen.getByText(/@grouper/i)).toBeInTheDocument();
      });

      // Select the group
      const checkbox = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
      await waitFor(() => user.click(checkbox));
      await waitFor(() => expect(checkbox).toBeChecked());
    });

    test('shows included packages in popover', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, '@grouper');

      // Wait for group to appear
      await waitFor(() => {
        expect(screen.getByText(/@grouper/i)).toBeInTheDocument();
      });

      // Click the help icon to open the popover
      const popoverBtn = await screen.findByRole('button', {
        name: /about included packages/i,
      });
      await waitFor(() => user.click(popoverBtn));

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
      await screen.findByRole('cell', { name: /test-lib/ });

      // Select the first package (sorted by relevance: 'test')
      await clickPackageCheckbox(user, 0);

      // Verify Redux state was updated
      await waitFor(() => {
        const packages = store.getState().wizard.packages;
        expect(packages).toHaveLength(1);
        expect(packages[0].name).toBe('test');
      });
    });

    test('deselecting a package removes it from Redux state', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      const { store } = renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('cell', { name: /test-lib/ });

      // Select then deselect
      await clickPackageCheckbox(user, 0);
      await waitFor(() => {
        expect(store.getState().wizard.packages).toHaveLength(1);
      });

      await clickPackageCheckbox(user, 0);
      await waitFor(() => {
        expect(store.getState().wizard.packages).toHaveLength(0);
      });
    });

    test('selecting multiple packages updates Redux state correctly', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      const { store } = renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await screen.findByRole('cell', { name: /test-lib/ });

      // Select all three packages
      await clickPackageCheckbox(user, 0); // test
      await clickPackageCheckbox(user, 1); // test-lib
      await clickPackageCheckbox(user, 2); // testPkg

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

      await typeIntoSearchBox(user, '@grouper');
      await waitFor(() => {
        expect(screen.getByText(/@grouper/i)).toBeInTheDocument();
      });

      await clickPackageCheckbox(user, 0);

      await waitFor(() => {
        const groups = store.getState().wizard.groups;
        expect(groups).toHaveLength(1);
        expect(groups[0].name).toBe('grouper');
      });
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
      await screen.findByText('1.24');

      // Select the first stream (1.24)
      await clickPackageCheckbox(user, 0);

      await waitFor(() => {
        const modules = store.getState().wizard.enabled_modules;
        expect(modules).toHaveLength(1);
        expect(modules[0].name).toBe('testModule');
        expect(modules[0].stream).toBe('1.24');
      });
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
      const user = createUser();

      // Verify initial Redux state has preloaded packages
      expect(store.getState().wizard.packages).toHaveLength(2);

      // Toggle to Selected view
      await toggleSelectedPackages(user);

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

      await screen.findByRole('cell', { name: /test-lib/ });

      // Select packages in reverse alphabetical order
      await clickPackageCheckbox(user, 2); // testPkg
      await clickPackageCheckbox(user, 1); // test-lib
      await clickPackageCheckbox(user, 0); // test

      // Toggle to Selected view
      await toggleSelectedPackages(user);

      // Verify all packages are shown and sorted
      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveTextContent('test');
      expect(rows[1]).toHaveTextContent('test-lib');
      expect(rows[2]).toHaveTextContent('testPkg');
    });

    test('shows empty state when no packages selected', async () => {
      renderPackagesStep();
      const user = createUser();

      // Toggle to Selected view without selecting anything
      await toggleSelectedPackages(user);

      expect(
        await screen.findByText(/there are no selected packages/i),
      ).toBeInTheDocument();
    });
  });
});
