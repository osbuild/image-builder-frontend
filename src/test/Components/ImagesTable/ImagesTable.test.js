import React from 'react';
import { screen, render, within } from '@testing-library/react';
import { renderWithReduxRouter } from '../../testUtils';
import ImagesTable from '../../../Components/ImagesTable/ImagesTable';
import ImageBuildStatus from '../../../Components/ImagesTable/ImageBuildStatus';
import ImageLink from '../../../Components/ImagesTable/ImageLink';
import Target from '../../../Components/ImagesTable/Target';
import '@testing-library/jest-dom';
import { RHEL_8 } from '../../../constants.js';
import userEvent from '@testing-library/user-event';

jest.mock('../../../store/actions/actions', () => {
  return {
    composesGet: () => ({ type: 'foo' }),
    composeGetStatus: () => ({ type: 'bar' }),
  };
});

const store = {
  composes: {
    errors: null,
    allIds: [
      'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
      'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
      '42ad0826-30b5-4f64-a24e-957df26fd564',
      '955944a2-e149-4058-8ac1-35b514cb5a16',
      'f7a60094-b376-4b58-a102-5c8c82dfd18b',
      '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
      '61b0effa-c901-4ee5-86b9-2010b47f1b22',
      'ca03f120-9840-4959-871e-94a5cb49d1f2',
      '551de6f6-1533-4b46-a69f-7924051f9bc6',
      '77fa8b03-7efb-4120-9a20-da66d68c4494',
    ],
    byId: {
      '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
        id: '1579d95b-8f1d-4982-8c53-8c2afa4ab04c',
        image_name: 'testImageName',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              ami: 'ami-0217b81d9be50e44b',
              region: 'us-east-1',
            },
            status: 'success',
            type: 'aws',
          },
        },
      },
      // kept "running" for backward compatibility
      'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa': {
        id: 'c1cfa347-4c37-49b5-8e73-6aa1d1746cfa',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'running',
        },
      },
      'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
        id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f58',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'pending',
        },
      },
      '42ad0826-30b5-4f64-a24e-957df26fd564': {
        id: '42ad0826-30b5-4f64-a24e-957df26fd564',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'building',
        },
      },
      '955944a2-e149-4058-8ac1-35b514cb5a16': {
        id: '955944a2-e149-4058-8ac1-35b514cb5a16',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'uploading',
        },
      },
      'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
        id: 'f7a60094-b376-4b58-a102-5c8c82dfd18b',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'registering',
        },
      },
      '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
        id: '61b0effa-c901-4ee5-86b9-2010b47f1b22',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'ami',
              upload_request: {
                type: 'aws',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'failure',
          error: {
            reason: 'A dependency error occured',
            details: {
              reason: 'Error in depsolve job',
            },
          },
        },
      },
      'ca03f120-9840-4959-871e-94a5cb49d1f2': {
        id: 'ca03f120-9840-4959-871e-94a5cb49d1f2',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'vhd',
              upload_request: {
                type: 'gcp',
                options: {
                  share_with_accounts: ['serviceAccount:test@email.com'],
                },
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              image_name: 'composer-api-d446d8cb-7c16-4756-bf7d-706293785b05',
              project_id: 'red-hat-image-builder',
            },
            status: 'success',
            type: 'gcp',
          },
        },
      },
      '551de6f6-1533-4b46-a69f-7924051f9bc6': {
        id: '551de6f6-1533-4b46-a69f-7924051f9bc6',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'vhd',
              upload_request: {
                type: 'azure',
                options: {},
              },
            },
          ],
        },
        image_status: {
          status: 'building',
        },
      },
      '77fa8b03-7efb-4120-9a20-da66d68c4494': {
        id: '77fa8b03-7efb-4120-9a20-da66d68c4494',
        created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'vhd',
              upload_request: {
                type: 'azure',
                options: {
                  tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
                  subscription_id: 'test-subscription-id',
                  resource_group: 'test-resource-group',
                },
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              image_name: 'composer-api-cc5920c3-5451-4282-aab3-725d3df7f1cb',
            },
            status: 'success',
            type: 'azure',
          },
        },
      },
      'b7193673-8dcc-4a5f-ac30-e9f4940d8346': {
        created_at: '2022-01-11 13:33:33.767002 +0000 UTC',
        id: 'b7193673-8dcc-4a5f-ac30-e9f4940d8346',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'vsphere',
              upload_request: {
                options: {},
                type: 'aws.s3',
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              url: 'https://s3.amazonaws.com/b7193673-8dcc-4a5f-ac30-e9f4940d8346-disk.vmdk',
            },
            status: 'success',
            type: 'aws.s3',
          },
        },
      },
      '4873fd0f-1851-4b9f-b4fe-4639fce90794': {
        created_at: '2022-01-11 13:33:33.767002 +0000 UTC',
        id: '4873fd0f-1851-4b9f-b4fe-4639fce90793',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'image-installer',
              upload_request: {
                options: {},
                type: 'aws.s3',
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              url: 'https://s3.amazonaws.com/4873fd0f-1851-4b9f-b4fe-4639fce90794-installer.iso',
            },
            status: 'success',
            type: 'aws.s3',
          },
        },
      },
      '7b7d0d51-7106-42ab-98f2-f89872a9d599': {
        created_at: '2022-01-11 13:33:33.767002 +0000 UTC',
        id: '7b7d0d51-7106-42ab-98f2-f89872a9d599',
        request: {
          distribution: RHEL_8,
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'guest-image',
              upload_request: {
                options: {},
                type: 'aws.s3',
              },
            },
          ],
        },
        image_status: {
          status: 'success',
          upload_status: {
            options: {
              url: 'https://s3.amazonaws.com/7b7d0d51-7106-42ab-98f2-f89872a9d599-disk.qcow2',
            },
            status: 'success',
            type: 'aws.s3',
          },
        },
      },
    },
  },
};

describe('Images Table', () => {
  test('render ImagesTable', () => {
    renderWithReduxRouter(<ImagesTable />, store);
    // make sure the empty-state message isn't present
    const emptyState = screen.queryByTestId('empty-state');
    expect(emptyState).not.toBeInTheDocument();

    // check table
    const table = screen.getByTestId('images-table');
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

      const composes = Object.values(store.composes.byId);
      // find compose with either the user defined image name or the uuid
      const compose = composes.find(
        (compose) => compose?.image_name === col1 || compose.id === col1
      );
      expect(compose).toBeTruthy();

      // date should match the month day and year of the timestamp.
      expect(row.cells[2]).toHaveTextContent('Apr 27, 2021');

      // render the expected <ImageBuildStatus /> and compare the text content
      let testElement = document.createElement('testElement');
      render(
        <Target
          imageType={compose.request.image_requests[0].image_type}
          uploadType={compose.request.image_requests[0].upload_request.type}
        />,
        { container: testElement }
      );
      expect(row.cells[4]).toHaveTextContent(testElement.textContent);

      // render the expected <ImageBuildStatus /> and compare the text content
      render(<ImageBuildStatus status={compose.image_status.status} />, {
        container: testElement,
      });
      expect(row.cells[5]).toHaveTextContent(testElement.textContent);

      // render the expected <ImageLink /> and compare the text content for a link
      render(
        <ImageLink
          imageStatus={compose.image_status}
          uploadOptions={
            compose.request.image_requests[0].upload_request.options
          }
        />,
        { container: testElement }
      );
      expect(row.cells[6]).toHaveTextContent(testElement.textContent);
    }
  });

  test('check recreate action', () => {
    const { history } = renderWithReduxRouter(<ImagesTable />, store);

    // get rows
    const table = screen.getByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const imageId = rows[1].cells[1].textContent;

    const actionsButton = within(rows[1]).getByRole('button', {
      name: 'Actions',
    });
    userEvent.click(actionsButton);
    const recreateButton = screen.getByRole('button', {
      name: 'Recreate image',
    });
    userEvent.click(recreateButton);

    expect(history.location.pathname).toBe('/imagewizard');
    expect(history.location.state.composeRequest).toStrictEqual(
      store.composes.byId[imageId].request
    );
    expect(history.location.state.initialStep).toBe('review');
  });

  test('check download compose request action', () => {
    renderWithReduxRouter(<ImagesTable />, store);

    // get rows
    const table = screen.getByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // first row is header so look at index 1
    const imageId = rows[1].cells[1].textContent;
    const expectedRequest = store.composes.byId[imageId].request;

    const actionsButton = within(rows[1]).getByRole('button', {
      name: 'Actions',
    });
    userEvent.click(actionsButton);

    const downloadButton = screen.getByRole('button', {
      name: 'Download compose request (.json)',
    });

    // No actual clicking because downloading is hard to test.
    // Instead, we just check href and download properties of the <a> element.
    const downloadLink = within(downloadButton).getByRole('link');
    expect(downloadLink.download).toBe('request.json');

    const hrefParts = downloadLink.href.split(',');
    expect(hrefParts.length).toBe(2);
    const [header, encodedRequest] = hrefParts;
    expect(header).toBe('data:text/plain;charset=utf-8');
    expect(encodedRequest).toBe(
      encodeURIComponent(JSON.stringify(expectedRequest))
    );
  });

  test('check expandable row toggle', () => {
    renderWithReduxRouter(<ImagesTable />, store);

    const table = screen.getByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const toggleButton = within(rows[6]).getByRole('button', {
      name: /details/i,
    });

    expect(
      screen.getAllByText(/1579d95b-8f1d-4982-8c53-8c2afa4ab04c/i)[1]
    ).not.toBeVisible();
    userEvent.click(toggleButton);
    expect(
      screen.getAllByText(/1579d95b-8f1d-4982-8c53-8c2afa4ab04c/i)[1]
    ).toBeVisible();
    userEvent.click(toggleButton);
    expect(
      screen.getAllByText(/1579d95b-8f1d-4982-8c53-8c2afa4ab04c/i)[1]
    ).not.toBeVisible();
  });

  test('check error details', () => {
    renderWithReduxRouter(<ImagesTable />, store);

    const table = screen.getByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const errorToggle = within(rows[7]).getByRole('button', {
      name: /details/i,
    });

    expect(
      screen.getAllByText(/61b0effa-c901-4ee5-86b9-2010b47f1b22/i)[1]
    ).not.toBeVisible();
    userEvent.click(errorToggle);

    expect(
      screen.getAllByText(/61b0effa-c901-4ee5-86b9-2010b47f1b22/i)[1]
    ).toBeVisible();
    expect(screen.getAllByText(/Error in depsolve job/i)[0]).toBeVisible();
  });
});

describe('Images Table Toolbar', () => {
  test('render toolbar', () => {
    renderWithReduxRouter(<ImagesTable />, store);
    // check create image button
    screen.getByTestId('create-image-action');

    // check pagination renders
    screen.getByTestId('images-pagination');
  });
});
