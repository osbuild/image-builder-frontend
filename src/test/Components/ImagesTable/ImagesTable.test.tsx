import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockComposes } from '../../fixtures/composes';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

describe('Images Table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  test('render ImagesTable', async () => {
    await renderCustomRoutesWithReduxRouter();

    const table = await screen.findByTestId('images-table');

    // make sure the empty state message isn't present
    const emptyState = screen.queryByText(
      /Image builder is a tool for creating deployment-ready customized system images/i,
    );
    await waitFor(() => expect(emptyState).not.toBeInTheDocument());

    // check table
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');
    // remove first row from list since it is just header labels
    const header: HTMLElement = rows.shift()!;
    const headerCells = await within(header).findAllByRole('columnheader');
    // test the header has correct labels
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

    // 10 rows for 10 images
    expect(rows).toHaveLength(10);
    rows.forEach(async (row, index) => {
      const cells = await within(row).findAllByRole('cell');
      // on prem the image_name gets lost
      if (process.env.IS_ON_PREMISE) {
        expect(cells[1]).toHaveTextContent(mockComposes[index].id);
      } else {
        expect(cells[1]).toHaveTextContent(imageNameValues[index]);
      }
      expect(cells[2]).toHaveTextContent('Apr 27, 2021');
      expect(cells[3]).toHaveTextContent('RHEL 8');
    });

    // TODO Test remaining table content.
  });

  test('check download compose request action', async () => {
    await renderCustomRoutesWithReduxRouter();

    // get rows
    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    // first row is header so look at index 1
    const actionsButton = await within(rows[1]).findByRole('button', {
      name: 'Kebab toggle',
    });
    await user.click(actionsButton);

    const downloadButton = await screen.findByRole('menuitem', {
      name: 'Download compose request (.json)',
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    const originalCreateObjectURL = globalThis.URL.createObjectURL;
    const originalRevokeObjectURL = globalThis.URL.revokeObjectURL;
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement
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
      // Click the download link
      const downloadLink: HTMLAnchorElement =
        await within(downloadButton).findByRole('link');
      await user.click(downloadLink);

      // Verify the download was triggered correctly
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
      // Restore mocks
      createElementSpy.mockRestore();
      globalThis.URL.createObjectURL = originalCreateObjectURL;
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  test('check expandable row toggle', async () => {
    await renderCustomRoutesWithReduxRouter();

    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const toggleButton = await within(rows[1]).findByRole('button', {
      name: /details/i,
    });

    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).not.toBeVisible();
    await user.click(toggleButton);
    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).toBeVisible();
    await user.click(toggleButton);
    expect(await screen.findByText(/ami-0217b81d9be50e44b/i)).not.toBeVisible();
  });

  test('check error details', async () => {
    await renderCustomRoutesWithReduxRouter();

    let table = await screen.findByTestId('images-table');
    let rows = await within(table).findAllByRole('row');

    // GCP image
    const errorPopoverR2 = await within(rows[2]).findByText(
      /image build failed/i,
    );
    // AWS image
    const errorPopoverR7 = await within(rows[7]).findByText(
      /image build failed/i,
    );

    expect(
      screen.getAllByText(/c1cfa347-4c37-49b5-8e73-6aa1d1746cfa/i)[1],
    ).not.toBeVisible();

    await user.click(errorPopoverR2);
    await screen.findByTestId('errorstatus-popover');
    await waitFor(() =>
      expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible(),
    );
    await user.click(errorPopoverR2);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    await user.click(errorPopoverR7);
    await screen.findByTestId('errorstatus-popover');
    await waitFor(() =>
      expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible(),
    );
    await user.click(errorPopoverR7);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    // Go to next page on the table
    const pagination = await screen.findByTestId('images-pagination-top');
    const pageButtons = await within(pagination).findAllByRole('button');
    await user.click(pageButtons[pageButtons.length - 1]);
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

    await user.click(errorPopoverP2R5);
    await screen.findByTestId('errorstatus-popover');
    expect(screen.getAllByText(/Something went very wrong/i)[0]).toBeVisible();
    expect(screen.getAllByText(/There was an error/i)[0]).toBeVisible();
    await user.click(errorPopoverP2R5);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover'),
      ).not.toBeInTheDocument(),
    );

    await user.click(errorPopoverP2R6);
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('render toolbar', async () => {
    await renderCustomRoutesWithReduxRouter();
    await screen.findByTestId('images-table');

    // check pagination renders
    await screen.findByTestId('images-pagination-top');
    await screen.findByTestId('images-pagination-bottom');
  });
});
