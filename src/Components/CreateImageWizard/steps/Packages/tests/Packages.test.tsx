import { fireEvent, screen, waitFor, within } from '@testing-library/react';

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
  mockOscapCustomizations,
  mockOscapProfile,
  mockOscapSearchResults,
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

  describe('Package Recommendations Gating', () => {
    test('do not show recommendations for RHEL 10', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));
      renderPackagesStep();
      const user = createUser();

      await typeIntoSearchBox(user, 'test');
      await selectPkgOption(user, 'test');
      await clickOnSearchBox(user);

      const options = await screen.findAllByRole('option');
      options.forEach((option) => {
        expect(option).not.toHaveTextContent(/suggested based on/i);
      });
    });

    test('do not show recommendations for package groups', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ groups: mockGroupSearchResults }),
      );
      renderPackagesStep();
      const user = createUser();

      await switchToPackageGroups(user);
      await typeIntoSearchBox(user, 'grouper');

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent(/grouper/i);
      expect(options[0]).not.toHaveTextContent(/suggested based on/i);
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

  describe('Required packages (OpenSCAP)', () => {
    const renderWithOscapPackages = () => {
      fetchMock.mockResponse(
        createFetchHandler({ oscap: mockOscapCustomizations }),
      );

      return renderPackagesStep({
        compliance: {
          complianceType: 'openscap',
          profileID: mockOscapProfile,
          policyID: undefined,
          policyTitle: undefined,
        },
        packages: [
          {
            name: 'aide',
            summary: 'Required by chosen OpenSCAP profile',
            repository: 'distro',
          },
          {
            name: 'neovim',
            summary: 'Required by chosen OpenSCAP profile',
            repository: 'distro',
          },
          {
            name: 'zsh',
            summary: 'User selected package',
            repository: 'distro',
          },
          {
            name: 'curl',
            summary: 'User selected package',
            repository: 'distro',
          },
        ],
      });
    };

    test('required packages appear before user-added packages', async () => {
      renderWithOscapPackages();

      await screen.findAllByTestId('required-package-row');

      // Query all rows together via the table to verify DOM order
      const table = screen.getByTestId('packages-table');
      const allRows = within(table).getAllByRole('row');
      // Filter to data rows (skip the header row)
      const dataRows = allRows.filter(
        (row) =>
          row.getAttribute('data-testid') === 'required-package-row' ||
          row.getAttribute('data-testid') === 'package-row',
      );

      expect(dataRows).toHaveLength(4);
      // Required packages first (alphabetical)
      expect(dataRows[0]).toHaveTextContent('aide');
      expect(dataRows[0]).toHaveAttribute(
        'data-testid',
        'required-package-row',
      );
      expect(dataRows[1]).toHaveTextContent('neovim');
      expect(dataRows[1]).toHaveAttribute(
        'data-testid',
        'required-package-row',
      );
      // User packages after (alphabetical)
      expect(dataRows[2]).toHaveTextContent('curl');
      expect(dataRows[2]).toHaveAttribute('data-testid', 'package-row');
      expect(dataRows[3]).toHaveTextContent('zsh');
      expect(dataRows[3]).toHaveAttribute('data-testid', 'package-row');
    });

    test('required packages have a disabled button with lock icon', async () => {
      renderWithOscapPackages();

      const requiredRows = await screen.findAllByTestId('required-package-row');

      // Required rows should have a disabled button
      for (const row of requiredRows) {
        const button = within(row).getByRole('button', {
          name: /cannot be removed/i,
        });
        expect(button).toBeDisabled();
      }

      // User rows should have enabled remove buttons
      const userRows = await screen.findAllByTestId('package-row');
      for (const row of userRows) {
        const button = within(row).getByRole('button', { name: /remove/i });
        expect(button).toBeEnabled();
      }
    });

    test('without oscap profile, all packages have remove buttons', async () => {
      renderPackagesStep({
        packages: [
          {
            name: 'zsh',
            summary: 'User selected package',
            repository: 'distro',
          },
          {
            name: 'curl',
            summary: 'User selected package',
            repository: 'distro',
          },
        ],
      });

      const rows = await screen.findAllByTestId('package-row');
      expect(rows).toHaveLength(2);

      // No required package rows should exist
      expect(screen.queryAllByTestId('required-package-row')).toHaveLength(0);

      // All rows should have enabled remove buttons
      for (const row of rows) {
        const button = within(row).getByRole('button', { name: /remove/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
      }
    });

    test('required packages cannot be removed via search dropdown', async () => {
      fetchMock.mockResponse(
        createFetchHandler({
          rpms: mockOscapSearchResults,
          oscap: mockOscapCustomizations,
        }),
      );

      const { store } = renderPackagesStep({
        compliance: {
          complianceType: 'openscap',
          profileID: mockOscapProfile,
          policyID: undefined,
          policyTitle: undefined,
        },
        packages: [
          {
            name: 'aide',
            summary: 'Advanced Intrusion Detection Environment',
            repository: 'distro',
          },
        ],
      });

      const user = createUser();

      // Verify the required package is in state
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('aide');

      // Search for the required package
      await typeIntoSearchBox(user, 'aide');

      // The search result for 'aide' should be disabled since it's required
      const aideOption = await screen.findByRole('option', { name: /aide/i });
      expect(aideOption).toBeDisabled();

      // Non-required package should not be disabled
      const testLibOption = await screen.findByRole('option', {
        name: /test-lib/i,
      });
      expect(testLibOption).not.toBeDisabled();

      // Clicking the disabled option should not remove the package
      await clickWithWait(user, aideOption);

      // Package should still be in state
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('aide');
    });

    test('onSelect guard prevents removal of required packages even when click bypasses disabled state', async () => {
      fetchMock.mockResponse(
        createFetchHandler({
          rpms: mockOscapSearchResults,
          oscap: mockOscapCustomizations,
        }),
      );

      const { store } = renderPackagesStep({
        compliance: {
          complianceType: 'openscap',
          profileID: mockOscapProfile,
          policyID: undefined,
          policyTitle: undefined,
        },
        packages: [
          {
            name: 'aide',
            summary: 'Advanced Intrusion Detection Environment',
            repository: 'distro',
          },
        ],
      });

      const user = createUser();

      expect(store.getState().wizard.packages).toHaveLength(1);

      await typeIntoSearchBox(user, 'aide');

      const aideOption = await screen.findByRole('option', { name: /aide/i });

      // fireEvent is used intentionally here instead of userEvent.
      // userEvent respects the native `disabled` attribute set by PatternFly
      // and won't dispatch the click, so the onSelect guard at line 742 of
      // PackageSearch.tsx would never be exercised. fireEvent bypasses
      // disabled checks, letting us verify the guard blocks removePackage
      // dispatch as a defense-in-depth measure.
      fireEvent.click(aideOption);

      // The onSelect guard should prevent the package from being removed
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('aide');
    });

    test('without compliance, search results are not disabled and packages can be toggled freely', async () => {
      fetchMock.mockResponse(createFetchHandler({ rpms: mockSearchResults }));

      const { store } = renderPackagesStep({
        packages: [
          {
            name: 'test-lib',
            summary: 'test-lib package summary',
            repository: 'distro',
          },
        ],
      });

      const user = createUser();

      // Verify the package is in state
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('test-lib');

      // Search for the already-selected package
      await typeIntoSearchBox(user, 'test');

      // All search options should be enabled (no compliance = no protection)
      const testLibOption = await screen.findByRole('option', {
        name: /test-lib/i,
      });
      expect(testLibOption).not.toBeDisabled();

      const testPkgOption = await screen.findByRole('option', {
        name: /testPkg/i,
      });
      expect(testPkgOption).not.toBeDisabled();

      // Clicking the selected package should remove it
      await clickWithWait(user, testLibOption);
      expect(store.getState().wizard.packages).toHaveLength(0);

      // Re-search and re-add the package
      await clearSearchInput(user);
      await typeIntoSearchBox(user, 'test');

      const testLibOptionAgain = await screen.findByRole('option', {
        name: /test-lib/i,
      });
      await clickWithWait(user, testLibOptionAgain);
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('test-lib');
    });

    test('required package not yet selected can still be added via search', async () => {
      fetchMock.mockResponse(
        createFetchHandler({
          rpms: mockOscapSearchResults,
          oscap: mockOscapCustomizations,
        }),
      );

      const { store } = renderPackagesStep({
        compliance: {
          complianceType: 'openscap',
          profileID: mockOscapProfile,
          policyID: undefined,
          policyTitle: undefined,
        },
        // aide is required but NOT in the initial packages list
        packages: [],
      });

      const user = createUser();

      // Search for the required package
      await typeIntoSearchBox(user, 'aide');

      // aide is required but not yet selected, so it should NOT be disabled
      const aideOption = await screen.findByRole('option', { name: /aide/i });
      expect(aideOption).not.toBeDisabled();

      // Select it — should be addable
      await clickWithWait(user, aideOption);

      // Verify it was added to Redux state
      expect(store.getState().wizard.packages).toHaveLength(1);
      expect(store.getState().wizard.packages[0].name).toBe('aide');

      // Re-open search and verify it's now disabled (required AND selected)
      await clearSearchInput(user);
      await typeIntoSearchBox(user, 'aide');

      const aideOptionAgain = await screen.findByRole('option', {
        name: /aide/i,
      });
      expect(aideOptionAgain).toBeDisabled();
    });
  });
});
