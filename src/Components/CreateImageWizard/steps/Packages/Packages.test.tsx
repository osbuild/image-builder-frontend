import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import createFetchMock from 'vitest-fetch-mock';

import { RHEL_10 } from '../../../../constants';
import { serviceMiddleware, serviceReducer } from '../../../../store';
import { initialState } from '../../../../store/wizardSlice';
import { server } from '../../../../test/mocks/server';

import PackagesStep from './index';

const mockSearchResults = [
  { package_name: 'test', summary: 'summary for test package' },
  { package_name: 'test-lib', summary: 'test-lib package summary' },
  { package_name: 'testPkg', summary: 'test package summary' },
];

const mockModuleSearchResults = [
  {
    package_name: 'testModule',
    summary: 'testModule summary',
    package_sources: [
      {
        name: 'testModule',
        type: 'module',
        stream: '1.22',
        end_date: '2025-05-01',
      },
      {
        name: 'testModule',
        type: 'module',
        stream: '1.24',
        end_date: '2027-05-01',
      },
    ],
  },
];

const mockGroupSearchResults = [
  {
    description: '',
    id: 'grouper',
    package_group_name: 'Grouper group',
    package_list: ['fish1', 'fish2'],
  },
];

const mockArchitectures: Record<
  string,
  Array<{
    arch: string;
    image_types: string[];
    repositories: Array<{ baseurl: string; rhsm: boolean }>;
  }>
> = {
  'rhel-10': [
    {
      arch: 'x86_64',
      image_types: ['aws', 'gcp', 'azure', 'guest-image'],
      repositories: [
        {
          baseurl:
            'https://cdn.redhat.com/content/dist/rhel10/10/x86_64/baseos/os',
          rhsm: true,
        },
      ],
    },
  ],
};

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// matching the url is kind of tricky with the content sources endpoints
// since we use query parameters and things get a bit complicated
const CONTENT_SOURCES_URL = 'http://localhost:3000/api/content-sources/v1';

// Disable global MSW server for this file - we use fetch mocks instead
beforeAll(() => {
  server.close();
});

// Restore global MSW server so other tests don't break
afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(({ url, method }) => {
    if (url.endsWith('/rpms/names') && method === 'POST') {
      return JSON.stringify([]);
    }

    if (url.endsWith('/package_groups/names') && method === 'POST') {
      return JSON.stringify([]);
    }

    if (url.endsWith('/architectures/rhel-10') && method === 'GET') {
      return JSON.stringify(mockArchitectures['rhel-10']);
    }

    if (
      url.startsWith(CONTENT_SOURCES_URL + '/repositories') &&
      method === 'GET'
    ) {
      return JSON.stringify({
        data: [],
        meta: { count: 0, limit: 100, offset: 0 },
      });
    }

    if (
      url.startsWith(CONTENT_SOURCES_URL + '/templates') &&
      method === 'GET'
    ) {
      return JSON.stringify({
        data: [],
        meta: { count: 0, limit: 100, offset: 0 },
      });
    }

    if (url.endsWith('/experimental/recommendations') && method === 'POST') {
      return JSON.stringify({ body: { packages: [] } });
    }

    throw new Error(`Unhandled fetch: ${method} ${url}`);
  });
});

afterEach(() => {
  fetchMock.resetMocks();
});

type WizardStateOverrides = Partial<typeof initialState>;

const renderPackagesStep = (
  wizardStateOverrides: WizardStateOverrides = {},
) => {
  const store = configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
    preloadedState: {
      wizard: {
        ...initialState,
        distribution: RHEL_10,
        architecture: 'x86_64',
        ...wizardStateOverrides,
      },
    },
  });

  const result = render(
    <Provider store={store}>
      <PackagesStep />
    </Provider>,
  );

  return { ...result, store };
};

const typeIntoSearchBox = async (
  user: ReturnType<typeof userEvent.setup>,
  searchTerm: string,
) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

const clearSearchInput = async (user: ReturnType<typeof userEvent.setup>) => {
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.clear(searchbox));
};

const clickPackageCheckbox = async (
  user: ReturnType<typeof userEvent.setup>,
  rowIndex: number,
) => {
  const checkbox = await screen.findByRole('checkbox', {
    name: new RegExp(`select row ${rowIndex}`, 'i'),
  });
  await waitFor(() => user.click(checkbox));
};

const toggleSelectedPackages = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  const selectedBtn = await screen.findByRole('button', { name: /selected/i });
  await waitFor(() => user.click(selectedBtn));
};

describe('Packages Component', () => {
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
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 't');

      expect(
        await screen.findByText('The search value is too short'),
      ).toBeInTheDocument();
    });

    test('shows "no results" for failed search', async () => {
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'asdf');
      fetchMock.mockOnce(JSON.stringify([]));

      // Wait for "No results found" to appear after debounce and API call complete
      // The debounce is 500ms, but we wait longer to account for API call timing
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    test('displays search results sorted by relevance', async () => {
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

      await screen.findByRole('cell', { name: /test-lib/ });

      const checkbox = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
      expect(checkbox).not.toBeChecked();

      await waitFor(() => user.click(checkbox));

      await waitFor(() => expect(checkbox).toBeChecked());
    });

    test('selected packages appear in Selected view', async () => {
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      // Search and select a package
      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');

      fetchMock.mockOnce(JSON.stringify(mockSearchResults));
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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'testModule');
      fetchMock.mockOnce(JSON.stringify(mockModuleSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'testModule');
      fetchMock.mockOnce(JSON.stringify(mockModuleSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, 'testModule');
      fetchMock.mockOnce(JSON.stringify(mockModuleSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, '@grouper');
      fetchMock.mockOnce(JSON.stringify(mockGroupSearchResults));

      // Wait for group to appear (groups show with @ prefix in the table)
      await waitFor(() => {
        expect(screen.getByText(/@grouper/i)).toBeInTheDocument();
      });
    });

    test('selecting a group checks the checkbox', async () => {
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, '@grouper');
      fetchMock.mockOnce(JSON.stringify(mockGroupSearchResults));

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
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      await typeIntoSearchBox(user, '@grouper');
      fetchMock.mockOnce(JSON.stringify(mockGroupSearchResults));

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

  describe('Selected Packages View', () => {
    test('selected packages are sorted alphabetically', async () => {
      renderPackagesStep();
      const user = userEvent.setup({ delay: null });

      // Search and select all packages (in reverse order to verify sorting)
      await typeIntoSearchBox(user, 'test');
      fetchMock.mockOnce(JSON.stringify(mockSearchResults));

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
      const user = userEvent.setup({ delay: null });

      // Toggle to Selected view without selecting anything
      await toggleSelectedPackages(user);

      expect(
        await screen.findByText(/there are no selected packages/i),
      ).toBeInTheDocument();
    });
  });
});
