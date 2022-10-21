import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import api from '../../../api.js';
import { renderWithReduxRouter } from '../../testUtils';
import ImagesTable from '../../../Components/ImagesTable/ImagesTable';
import ImageBuildStatus from '../../../Components/ImagesTable/ImageBuildStatus';
import ImageLink from '../../../Components/ImagesTable/ImageLink';
import Target from '../../../Components/ImagesTable/Target';
import '@testing-library/jest-dom';
import { RHEL_8 } from '../../../constants.js';

const currentDate = new Date();
let currentDateInString = currentDate.toString();

const mockComposes = {
  meta: {
    count: 12,
  },
  data: [
    {
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
    },
    // kept "running" for backward compatibility
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
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
    },
    {
      created_at: '2021-04-27 12:31:12.794809 +0000 UTC',
      id: '4873fd0f-1851-4b9f-b4fe-4639fce90794',
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
    },
    {
      created_at: currentDateInString,
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
    },
  ],
};

const mockStatus = {
  '1579d95b-8f1d-4982-8c53-8c2afa4ab04c': {
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
    image_status: {
      status: 'running',
    },
  },
  'edbae1c2-62bc-42c1-ae0c-3110ab718f58': {
    image_status: {
      status: 'pending',
    },
  },
  '42ad0826-30b5-4f64-a24e-957df26fd564': {
    image_status: {
      status: 'building',
    },
  },
  '955944a2-e149-4058-8ac1-35b514cb5a16': {
    image_status: {
      status: 'uploading',
    },
  },
  'f7a60094-b376-4b58-a102-5c8c82dfd18b': {
    image_status: {
      status: 'registering',
    },
  },
  '61b0effa-c901-4ee5-86b9-2010b47f1b22': {
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
    image_status: {
      status: 'building',
    },
  },
  'b7193673-8dcc-4a5f-ac30-e9f4940d8346': {
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
};

const mockClones = {};

jest
  .spyOn(api, 'getComposes')
  .mockImplementation(() => Promise.resolve(mockComposes));

jest.spyOn(api, 'getComposeStatus').mockImplementation((id) => {
  return Promise.resolve(mockStatus[id]);
});

jest
  .spyOn(api, 'getClones')
  .mockImplementation(() => Promise.resolve(mockClones));

describe('Images Table', () => {
  test('render ImagesTable', async () => {
    renderWithReduxRouter(<ImagesTable />, {});
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
      if (
        compose.created_at === '2021-04-27 12:31:12.794809 +0000 UTC' &&
        compose.request.image_requests[0].upload_request.type === 'aws.s3'
      ) {
        expect(row.cells[5]).toHaveTextContent('Expired');
      } else {
        render(
          <ImageBuildStatus
            status={mockStatus[compose.id].image_status.status}
          />,
          {
            container: testElement,
          }
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
        render(
          <BrowserRouter>
            <ImageLink
              imageStatus={mockStatus[compose.id].image_status}
              uploadOptions={
                compose.request.image_requests[0].upload_request.options
              }
            />
          </BrowserRouter>,
          { container: testElement }
        );
        expect(row.cells[6]).toHaveTextContent(testElement.textContent);
      }
    }
  });

  test('check recreate action', async () => {
    const { history } = renderWithReduxRouter(<ImagesTable />, {});

    // get rows
    const table = await screen.findByTestId('images-table');
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

    expect(history.location.pathname).toBe(
      '/insights/image-builder/imagewizard'
    );
    expect(history.location.state.composeRequest).toStrictEqual(
      mockComposes.data.find((c) => c.id === imageId).request
    );
    expect(history.location.state.initialStep).toBe('review');
  });

  test('check download compose request action', async () => {
    renderWithReduxRouter(<ImagesTable />, {});

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
    userEvent.click(actionsButton);

    const downloadButton = screen.getByRole('button', {
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
      encodeURIComponent(JSON.stringify(expectedRequest))
    );
  });

  test('check expandable row toggle', async () => {
    renderWithReduxRouter(<ImagesTable />, {});

    const table = await screen.findByTestId('images-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const toggleButton = within(rows[1]).getByRole('button', {
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

  test('check error details', async () => {
    renderWithReduxRouter(<ImagesTable />, {});

    const table = await screen.findByTestId('images-table');
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
  test('render toolbar', async () => {
    renderWithReduxRouter(<ImagesTable />, {});
    await screen.findByTestId('images-table');

    // check create image button
    screen.getByTestId('create-image-action');

    // check pagination renders
    screen.getByTestId('images-pagination-top');
    screen.getByTestId('images-pagination-bottom');
  });
});
