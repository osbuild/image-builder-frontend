import React from 'react';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import api from '../../../api.js';
import { ImageBuildStatus } from '../../../Components/ImagesTable/ImageBuildStatus';
import ImageLink from '../../../Components/ImagesTable/ImageLink';
import Target from '../../../Components/ImagesTable/Target';
import '@testing-library/jest-dom';
import {
  mockComposes,
  mockStatus,
  mockClones,
  mockCloneStatus,
  mockNoClones,
} from '../../fixtures/composes.js';
import { renderWithProvider, renderWithReduxRouter } from '../../testUtils';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest
  .spyOn(api, 'getComposes')
  .mockImplementation(() => Promise.resolve(mockComposes));

jest.spyOn(api, 'getComposeStatus').mockImplementation((id) => {
  return Promise.resolve(mockStatus[id]);
});

jest.spyOn(api, 'getClones').mockImplementation((id) => {
  return id === '1579d95b-8f1d-4982-8c53-8c2afa4ab04c'
    ? Promise.resolve(mockClones(id))
    : Promise.resolve(mockNoClones);
});

jest.spyOn(api, 'getCloneStatus').mockImplementation((id) => {
  return Promise.resolve(mockCloneStatus[id]);
});

describe('Images Table', () => {
  const user = userEvent.setup();
  test('render ImagesTable', async () => {
    const view = renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');

    // make sure the empty-state message isn't present
    const emptyState = screen.queryByTestId('empty-state');
    expect(emptyState).not.toBeInTheDocument();

    const state = view.store.getState();

    // check table
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');
    // remove first row from list since it is just header labels
    const header = rows.shift();
    // test the header has correct labels
    expect(header.cells[1]).toHaveTextContent('Image name');
    expect(header.cells[2]).toHaveTextContent('Created');
    expect(header.cells[3]).toHaveTextContent('Release');
    expect(header.cells[4]).toHaveTextContent('Target');
    expect(header.cells[5]).toHaveTextContent('Status');
    expect(header.cells[6]).toHaveTextContent('Instance');

    // 10 rows for 10 images
    expect(rows).toHaveLength(10);
    for (const row of rows) {
      const col1 = row.cells[1].textContent;

      // find compose with either the user defined image name or the uuid
      const compose = mockComposes.data.find(
        (compose) => compose?.image_name === col1 || compose.id === col1
      );
      expect(compose).toBeTruthy();

      // date should match the month day and year of the timestamp.
      expect(row.cells[2]).toHaveTextContent('Apr 27, 2021');

      // render the expected <ImageBuildStatus /> and compare the text content
      const testElement = document.createElement('testElement');
      // render(<Target composeId={compose.id} />, { container: testElement });
      renderWithProvider(<Target composeId={compose.id} />, testElement, state);
      expect(row.cells[4]).toHaveTextContent(testElement.textContent);

      // render the expected <ImageBuildStatus /> and compare the text content
      if (
        compose.created_at === '2021-04-27 12:31:12.794809 +0000 UTC' &&
        compose.request.image_requests[0].upload_request.type === 'aws.s3'
      ) {
        expect(row.cells[5]).toHaveTextContent('Expired');
      } else {
        renderWithProvider(
          <ImageBuildStatus imageId={compose.id} isImagesTableRow={true} />,
          testElement,
          state
        );
        expect(row.cells[5]).toHaveTextContent(testElement.textContent);
      }

      // render the expected <ImageLink /> and compare the text content for a link
      if (
        compose.created_at === '2021-04-27 12:31:12.794809 +0000 UTC' &&
        compose.request.image_requests[0].upload_request.type === 'aws.s3'
      ) {
        expect(row.cells[6]).toHaveTextContent('Recreate image');
      } else {
        renderWithProvider(
          <BrowserRouter>
            <ImageLink imageId={compose.id} isInClonesTable={false} />
          </BrowserRouter>,
          testElement,
          state
        );
        expect(row.cells[6]).toHaveTextContent(testElement.textContent);
      }
    }
  });

  test('check recreate action', async () => {
    const { router } = renderWithReduxRouter('', {});

    // get rows
    const table = await screen.findByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const imageId = rows[1].cells[1].textContent;

    const actionsButton = within(rows[1]).getByRole('button', {
      name: 'Actions',
    });
    await user.click(actionsButton);
    const recreateButton = screen.getByRole('menuitem', {
      name: 'Recreate image',
    });
    await user.click(recreateButton);

    expect(router.state.location.pathname).toBe(
      `/insights/image-builder/imagewizard/${imageId}`
    );
  });

  test('check download compose request action', async () => {
    renderWithReduxRouter('', {});

    // get rows
    const table = await screen.findByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const imageId = rows[1].cells[1].textContent;
    const expectedRequest = mockComposes.data.filter((c) => c.id === imageId)[0]
      .request;

    const actionsButton = within(rows[1]).getByRole('button', {
      name: 'Actions',
    });
    await user.click(actionsButton);

    const downloadButton = screen.getByRole('menuitem', {
      name: 'Download compose request (.json)',
    });

    // No actual clicking because downloading is hard to test.
    // Instead, we just check href and download properties of the <a> element.
    const downloadLink = within(downloadButton).getByRole('link');
    expect(downloadLink.download).toBe(
      'request-1579d95b-8f1d-4982-8c53-8c2afa4ab04c.json'
    );

    const hrefParts = downloadLink.href.split(',');
    expect(hrefParts.length).toBe(2);
    const [header, encodedRequest] = hrefParts;
    expect(header).toBe('data:text/plain;charset=utf-8');
    expect(encodedRequest).toBe(
      encodeURIComponent(JSON.stringify(expectedRequest, null, '  '))
    );
  });

  test('check expandable row toggle', async () => {
    renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const toggleButton = within(rows[1]).getByRole('button', {
      name: /details/i,
    });

    expect(screen.getByText(/ami-0e778053cd490ad21/i)).not.toBeVisible();
    await user.click(toggleButton);
    expect(screen.getByText(/ami-0e778053cd490ad21/i)).toBeVisible();
    await user.click(toggleButton);
    expect(screen.getByText(/ami-0e778053cd490ad21/i)).not.toBeVisible();
  });

  test('check error details', async () => {
    renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const errorPopover = within(rows[2]).getByText(/image build failed/i);

    expect(
      screen.getAllByText(/c1cfa347-4c37-49b5-8e73-6aa1d1746cfa/i)[1]
    ).not.toBeVisible();
    await user.click(errorPopover);

    expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible();
  });
});

describe('Images Table Toolbar', () => {
  test('render toolbar', async () => {
    renderWithReduxRouter('', {});
    await screen.findByTestId('images-table');

    // check create image button
    screen.getByTestId('create-image-action');

    // check pagination renders
    screen.getByTestId('images-pagination-top');
    screen.getByTestId('images-pagination-bottom');
  });
});

describe('Clones table', () => {
  test('renders clones table', async () => {
    renderWithReduxRouter('', {});

    const table = await screen.findByTestId('images-table');

    // make sure the empty-state message isn't present
    const emptyState = screen.queryByTestId('empty-state');
    expect(emptyState).not.toBeInTheDocument();

    // get rows
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const detailsButton = within(rows[1]).getByRole('button', {
      name: /details/i,
    });
    detailsButton.click();

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
          (clone) => mockCloneStatus[clone.id].options.ami
        ),
      ],
      created: [...mockClones(composeId).data.map((clone) => clone.created_at)],
      region: [
        ...mockClones(composeId).data.map(
          (clone) => mockCloneStatus[clone.id].options.region
        ),
      ],
    };

    for (const [index, row] of cloneRows.entries()) {
      // render AMIs in correct order
      switch (index) {
        case (0, 1, 3):
          expect(row.cells[0]).toHaveTextContent(clonesTableData.ami[index]);
          break;
        case 2:
          expect(row.cells[0]).toHaveTextContent('');
          break;
      }

      // region cell
      expect(row.cells[1]).toHaveTextContent(clonesTableData.region[index]);

      // status cell
      switch (index) {
        case (0, 1, 3):
          expect(row.cells[2]).toHaveTextContent('Ready');
          break;
        case 2:
          expect(row.cells[2]).toHaveTextContent('Image build failed');
          break;
      }
    }
  });
});
