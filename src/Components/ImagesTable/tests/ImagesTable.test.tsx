import { screen, waitFor, within } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { clickWithWait, createUser } from '@/test/testUtils';

import { renderImagesTable } from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  DARK_CHOCOLATE_BLUEPRINT_ID,
  fetchMock,
  mockComposes,
} from './mocks';

fetchMock.enableMocks();

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
  vi.restoreAllMocks();
});

describe('Images Table', () => {
  test('renders table with correct headers and row data', async () => {
    await renderImagesTable();

    const table = await screen.findByTestId('images-table');

    const emptyState = screen.queryByText(
      /Image builder is a tool for creating deployment-ready customized system images/i,
    );
    expect(emptyState).not.toBeInTheDocument();

    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');
    const header: HTMLElement = rows.shift()!;
    const headerCells = await within(header).findAllByRole('columnheader');

    expect(headerCells[1]).toHaveTextContent('Name');
    expect(headerCells[2]).toHaveTextContent('Updated');
    expect(headerCells[3]).toHaveTextContent('OS');
    expect(headerCells[4]).toHaveTextContent('Target');
    expect(headerCells[5]).toHaveTextContent('Version');
    expect(headerCells[6]).toHaveTextContent('Status');
    expect(headerCells[7]).toHaveTextContent('Instance');

    const imageNameValues = mockComposes.map((compose) =>
      compose.image_name ? compose.image_name : compose.id,
    );

    expect(rows).toHaveLength(10);
    for (const [index, row] of rows.entries()) {
      const cells = await within(row).findAllByRole('cell');
      expect(cells[1]).toHaveTextContent(imageNameValues[index]);
      if (mockComposes[index].id !== 'image-mode-bootc-rhel9') {
        expect(cells[2]).toHaveTextContent('Apr 27, 2021');
        expect(cells[3]).toHaveTextContent('RHEL 8');
      }
    }
  });

  test('displays OS from bootc reference when compose has no distribution (image mode)', async () => {
    const user = createUser();
    await renderImagesTable();

    await screen.findByTestId('images-table');

    const pagination = await screen.findByTestId('images-pagination-top');
    const nextPage = within(pagination).getByRole('button', {
      name: 'Go to next page',
    });
    await clickWithWait(user, nextPage);
    await clickWithWait(user, nextPage);

    const table = await screen.findByTestId('images-table');

    const imageModeRow = await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      const dataRows = rows.slice(1);
      const row = dataRows.find((r) =>
        within(r).queryByText('image-mode-rhel9'),
      );
      if (!row) throw new Error('Row not found');
      return row;
    });

    const cells = within(imageModeRow).getAllByRole('cell');
    const osCell = cells[3];
    expect(osCell).toHaveTextContent('RHEL 9.7');
  });

  test('displays Package mode and Image mode labels for blueprint-linked composes', async () => {
    const user = createUser();
    await renderImagesTable();

    await screen.findByTestId('images-table');

    const pagination = await screen.findByTestId('images-pagination-top');
    const nextPage = within(pagination).getByRole('button', {
      name: 'Go to next page',
    });
    await clickWithWait(user, nextPage);

    const table = await screen.findByTestId('images-table');

    const packageModeRow = await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      const dataRows = rows.slice(1);
      const row = dataRows.find((r) =>
        within(r).queryByText('package-mode-bp-image'),
      );
      if (!row) throw new Error('Package mode row not found');
      return row;
    });
    expect(
      within(packageModeRow).getByText('Package mode'),
    ).toBeInTheDocument();

    const imageModeRow = await waitFor(() => {
      const rows = within(table).getAllByRole('row');
      const dataRows = rows.slice(1);
      const row = dataRows.find((r) =>
        within(r).queryByText('image-mode-bp-image'),
      );
      if (!row) throw new Error('Image mode row not found');
      return row;
    });
    expect(within(imageModeRow).getByText('Image mode')).toBeInTheDocument();
  });

  test('displays Package mode and Image mode labels in blueprint-filtered view', async () => {
    await renderImagesTable({
      preloadedState: {
        blueprints: {
          selectedBlueprintId: DARK_CHOCOLATE_BLUEPRINT_ID,
          searchInput: undefined,
          offset: 0,
          limit: 10,
          versionFilter: 'all',
        },
      },
    });

    const table = await screen.findByTestId('images-table');

    await waitFor(() => {
      expect(within(table).getAllByText('Package mode').length).toBeGreaterThan(
        0,
      );
    });
    expect(within(table).getByText('Image mode')).toBeInTheDocument();
  });

  test('check download compose request action', async () => {
    const user = createUser();
    await renderImagesTable();

    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const actionsButton = await within(rows[1]).findByRole('button', {
      name: 'Kebab toggle',
    });
    await clickWithWait(user, actionsButton);

    const downloadButton = await screen.findByRole('menuitem', {
      name: 'Download compose request (.json)',
    });

    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName) => {
        if (tagName === 'a') {
          return mockLink;
        }
        return originalCreateElement(tagName);
      });

    try {
      await clickWithWait(user, downloadButton);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'application/json',
          }),
        );
        expect(mockLink.download).toBe(
          'request-1579d95b-8f1d-4982-8c53-8c2afa4ab04c.json',
        );
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });
    } finally {
      createElementSpy.mockRestore();
      globalThis.URL.createObjectURL = originalCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  test('check expandable row toggle', async () => {
    const user = createUser();
    await renderImagesTable();

    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const toggleButton = await within(rows[1]).findByRole('button', {
      name: /details/i,
    });

    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).not.toBeVisible();
    await clickWithWait(user, toggleButton);
    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).toBeVisible();
    await clickWithWait(user, toggleButton);
    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).not.toBeVisible();
  });

  test('check error details', async () => {
    const user = createUser();
    await renderImagesTable();

    let table = await screen.findByTestId('images-table');
    let rows = await within(table).findAllByRole('row');

    const errorPopoverR2 = await within(rows[2]).findByText(
      /image build failed/i,
    );
    const errorPopoverR7 = await within(rows[7]).findByText(
      /image build failed/i,
    );

    expect(
      screen.getAllByText(/c1cfa347-4c37-49b5-8e73-6aa1d1746cfa/i)[1],
    ).not.toBeVisible();

    await clickWithWait(user, errorPopoverR2);
    await screen.findByTestId('errorstatus-popover');
    await waitFor(() =>
      expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible(),
    );
    await clickWithWait(user, errorPopoverR2);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    await clickWithWait(user, errorPopoverR7);
    await screen.findByTestId('errorstatus-popover');
    await waitFor(() =>
      expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible(),
    );
    await clickWithWait(user, errorPopoverR7);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    const pagination = await screen.findByTestId('images-pagination-top');
    const nextPage = within(pagination).getByRole('button', {
      name: 'Go to next page',
    });
    await clickWithWait(user, nextPage);
    await screen.findAllByText(/9e7d0d51-7106-42ab-98f2-f89872a9d599/i);

    rows = [];
    table = await screen.findByTestId('images-table');
    rows = await within(table).findAllByRole('row');

    const errorPopoverP2R5 = await within(rows[5]).findByText(
      /image build failed/i,
    );
    const errorPopoverP2R6 = await within(rows[6]).findByText(
      /image build failed/i,
    );

    await clickWithWait(user, errorPopoverP2R5);
    await screen.findByTestId('errorstatus-popover');
    expect(screen.getAllByText(/Something went very wrong/i)[0]).toBeVisible();
    expect(screen.getAllByText(/There was an error/i)[0]).toBeVisible();
    await clickWithWait(user, errorPopoverP2R5);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    await clickWithWait(user, errorPopoverP2R6);
    await screen.findByTestId('errorstatus-popover');
    await waitFor(() =>
      expect(
        screen.getAllByText(/Something went very wrong for Azure/i)[0],
      ).toBeVisible(),
    );
    await waitFor(() =>
      expect(screen.getAllByText(/There was an error/i)[0]).toBeVisible(),
    );
  });
});

describe('Images Table Toolbar', () => {
  test('render toolbar', async () => {
    await renderImagesTable();
    await screen.findByTestId('images-table');

    await screen.findByTestId('images-pagination-top');
    await screen.findByTestId('images-pagination-bottom');
  });
});
