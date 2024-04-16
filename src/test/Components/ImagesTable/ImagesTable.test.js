import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';
import {
  mockComposes,
  mockClones,
  mockCloneStatus,
} from '../../fixtures/composes';
import { renderWithReduxRouter } from '../../testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) => {
    switch (flag) {
      case 'edgeParity.image-list':
        return false;
      case 'image-builder.new-wizard.enabled':
        return false;
      default:
        return true;
    }
  }),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

describe('Images Table', () => {
  const user = userEvent.setup();
  test('render ImagesTable', async () => {
    await renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');

    // make sure the empty-state message isn't present
    const emptyState = screen.queryByTestId('empty-state');
    expect(emptyState).not.toBeInTheDocument();

    // check table
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');
    // remove first row from list since it is just header labels
    const header = rows.shift();
    // test the header has correct labels
    expect(header.cells[1]).toHaveTextContent('Name');
    expect(header.cells[2]).toHaveTextContent('Updated');
    expect(header.cells[3]).toHaveTextContent('OS');
    expect(header.cells[4]).toHaveTextContent('Target');
    expect(header.cells[5]).toHaveTextContent('Status');
    expect(header.cells[6]).toHaveTextContent('Instance');

    const imageNameValues = mockComposes.map((compose) =>
      compose.image_name ? compose.image_name : compose.id
    );

    // 10 rows for 10 images
    expect(rows).toHaveLength(10);
    rows.forEach(async (row, index) => {
      expect(row.cells[1]).toHaveTextContent(imageNameValues[index]);
      expect(row.cells[2]).toHaveTextContent('Apr 27, 2021');
      expect(row.cells[3]).toHaveTextContent('RHEL 8.9');
    });

    // TODO Test remaining table content.
  });

  test('check recreate action', async () => {
    const { router } = await renderWithReduxRouter('', {});

    // get rows
    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const actionsButton = await within(rows[1]).findByRole('button', {
      name: 'Kebab toggle',
    });

    expect(actionsButton).toBeEnabled();

    await user.click(actionsButton);
    const recreateButton = await screen.findByRole('menuitem', {
      name: 'Recreate image',
    });

    await user.click(recreateButton);

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/insights/image-builder/imagewizard/1579d95b-8f1d-4982-8c53-8c2afa4ab04c'
      )
    );
  });

  test('check download compose request action', async () => {
    await renderWithReduxRouter('', {});

    // get rows
    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const expectedRequest = mockComposes[0].request;

    // first row is header so look at index 1
    const actionsButton = await within(rows[1]).findByRole('button', {
      name: 'Kebab toggle',
    });
    await user.click(actionsButton);

    const downloadButton = await screen.findByRole('menuitem', {
      name: 'Download compose request (.json)',
    });

    // No actual clicking because downloading is hard to test.
    // Instead, we just check href and download properties of the <a> element.
    const downloadLink = await within(downloadButton).findByRole('link');
    expect(downloadLink.download).toBe(
      'request-1579d95b-8f1d-4982-8c53-8c2afa4ab04c.json'
    );

    const hrefParts = downloadLink.href.split(',');
    expect(hrefParts.length).toBe(2);
    const [header, encodedRequest] = hrefParts;
    expect(header).toBe('data:text/plain;charset=utf-8');

    await waitFor(() =>
      expect(encodedRequest).toBe(
        encodeURIComponent(JSON.stringify(expectedRequest, null, '  '))
      )
    );
  });

  test('check expandable row toggle', async () => {
    await renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');
    const { findAllByRole } = within(table);
    const rows = await findAllByRole('row');

    const toggleButton = await within(rows[1]).findByRole('button', {
      name: /details/i,
    });

    expect(await screen.findByText(/ami-0e778053cd490ad21/i)).not.toBeVisible();
    await user.click(toggleButton);
    expect(await screen.findByText(/ami-0e778053cd490ad21/i)).toBeVisible();
    await user.click(toggleButton);
    expect(await screen.findByText(/ami-0e778053cd490ad21/i)).not.toBeVisible();
  });

  test('check error details', async () => {
    await renderWithReduxRouter('', {});

    let table = await screen.findByTestId('images-table');
    let rows = await within(table).findAllByRole('row');

    // GCP image
    const errorPopoverR2 = await within(rows[2]).findByText(
      /image build failed/i
    );
    // AWS image
    const errorPopoverR7 = await within(rows[7]).findByText(
      /image build failed/i
    );

    expect(
      screen.getAllByText(/c1cfa347-4c37-49b5-8e73-6aa1d1746cfa/i)[1]
    ).not.toBeVisible();

    await user.click(errorPopoverR2);
    await screen.findByTestId('errorstatus-popover');
    expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible();
    await user.click(errorPopoverR2);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover')
      ).not.toBeInTheDocument()
    );

    await user.click(errorPopoverR7);
    await screen.findByTestId('errorstatus-popover');
    expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible();
    await user.click(errorPopoverR7);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover')
      ).not.toBeInTheDocument()
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
      /image build failed/i
    );
    const errorPopoverP2R6 = await within(rows[6]).findByText(
      /image build failed/i
    );

    await user.click(errorPopoverP2R5);
    await screen.findByTestId('errorstatus-popover');
    expect(screen.getAllByText(/Something went very wrong/i)[0]).toBeVisible();
    expect(screen.getAllByText(/There was an error/i)[0]).toBeVisible();
    await user.click(errorPopoverP2R5);
    await waitFor(() =>
      expect(
        screen.queryByTestId('errorstatus-popover')
      ).not.toBeInTheDocument()
    );

    await user.click(errorPopoverP2R6);
    await screen.findByTestId('errorstatus-popover');
    expect(
      screen.getAllByText(/Something went very wrong for Azure/i)[0]
    ).toBeVisible();
    expect(screen.getAllByText(/There was an error/i)[0]).toBeVisible();
  });
});

describe('Images Table Toolbar', () => {
  test('render toolbar', async () => {
    await renderWithReduxRouter('', {});
    await screen.findByTestId('images-table');

    // check pagination renders
    await screen.findByTestId('images-pagination-top');
    await screen.findByTestId('images-pagination-bottom');
  });
});

describe('Clones table', () => {
  const user = userEvent.setup();
  test('renders clones table', async () => {
    await renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');

    // make sure the empty-state message isn't present
    const emptyState = screen.queryByTestId('empty-state');
    expect(emptyState).not.toBeInTheDocument();

    // get rows
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const detailsButton = await within(rows[1]).findByRole('button', {
      name: /details/i,
    });
    await user.click(detailsButton);

    // Multiple clones tables exist (one per AWS image), get the first one (which has clones)
    const clonesTable = await screen.findAllByTestId('clones-table');
    const cloneRows = within(clonesTable[0]).getAllByRole('row');

    // remove first row from list since it is just header labels
    const header = cloneRows.shift();
    // test the header has correct labels
    expect(header.cells[0]).toHaveTextContent('AMI');
    expect(header.cells[1]).toHaveTextContent('Region');
    expect(header.cells[2]).toHaveTextContent('Status');

    // shift by a parent compose as the row has a different format
    cloneRows.shift();

    expect(cloneRows).toHaveLength(4);

    // prepend parent data
    const composeId = '1579d95b-8f1d-4982-8c53-8c2afa4ab04c';
    const clonesTableData = {
      ami: [
        ...mockClones(composeId).data.map(
          (clone) => mockCloneStatus(clone.id).options.ami
        ),
      ],
      created: [...mockClones(composeId).data.map((clone) => clone.created_at)],
      region: [
        ...mockClones(composeId).data.map(
          (clone) => mockCloneStatus(clone.id).options.region
        ),
      ],
    };

    for (const [index, row] of cloneRows.entries()) {
      // render AMIs in correct order
      let toTest = expect(row.cells[0]);
      switch (index) {
        case (0, 1, 3):
          toTest.toHaveTextContent(clonesTableData.ami[index]);
          break;
        case 2:
          toTest.toHaveTextContent('');
          break;
        // no default
      }

      // region cell
      expect(row.cells[1]).toHaveTextContent(clonesTableData.region[index]);

      toTest = expect(row.cells[2]);
      // status cell
      switch (index) {
        case (0, 1, 3):
          toTest.toHaveTextContent('Ready');
          break;
        case 2:
          toTest.toHaveTextContent('Sharing image failed');
          break;
        // no default
      }
    }
  });
});
